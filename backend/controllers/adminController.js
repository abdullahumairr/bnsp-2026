const db = require("../config/db");
const bcrypt = require("bcryptjs");

// --- DASHBOARD METRICS ---
exports.getDashboardMetrics = async (req, res) => {
  try {
    const salesResult = await db.query(
      `SELECT SUM(total_amount) as total FROM transactions WHERE status='completed'`,
    );
    const booksResult = await db.query(
      `SELECT SUM(stock) as total_stock FROM books`,
    );
    const usersResult = await db.query(
      `SELECT COUNT(id) as total_users FROM users`,
    );

    const transResult = await db.query(`
      SELECT 
        t.id,
        t.total_amount,
        t.status,
        t.created_at,
        t.full_name,
        t.city,
        STRING_AGG(b.title, ', ') AS books_title
      FROM transactions t 
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN books b ON ti.book_id = b.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.status(200).json({
      totalSales: salesResult.rows[0].total || 0,
      totalBooks: booksResult.rows[0].total_stock || 0,
      totalUsers: usersResult.rows[0].total_users || 0,
      recentTransactions: transResult.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BOOK CRUD ---
exports.createBook = async (req, res) => {
  const {
    title,
    author,
    price,
    discount_price,
    stock,
    description,
    technical_details,
    category_id,
    is_editors_choice,
  } = req.body;
  const image_url = req.file ? req.file.path : null; // cloudinary URL
  try {
    await db.query(
      `INSERT INTO books (title, author, price, discount_price, stock, description, technical_details, image_url, category_id, is_editors_choice) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        title,
        author,
        price,
        discount_price || null,
        stock,
        description,
        technical_details,
        image_url,
        category_id,
        is_editors_choice || false,
      ],
    );
    res.status(201).json({ message: "Book created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  const {
    title,
    author,
    price,
    discount_price,
    stock,
    description,
    technical_details,
    category_id,
    is_editors_choice,
  } = req.body;
  const bookId = req.params.id;

  try {
    let query;
    let params;

    if (req.file) {
      query = `UPDATE books SET title=$1, author=$2, price=$3, discount_price=$4, stock=$5, 
               description=$6, technical_details=$7, category_id=$8, is_editors_choice=$9, 
               image_url=$10 WHERE id=$11`;
      params = [
        title,
        author,
        price,
        discount_price || null,
        stock,
        description,
        technical_details,
        category_id,
        is_editors_choice,
        req.file.path,
        bookId,
      ];
    } else {
      query = `UPDATE books SET title=$1, author=$2, price=$3, discount_price=$4, stock=$5, 
               description=$6, technical_details=$7, category_id=$8, is_editors_choice=$9 
               WHERE id=$10`;
      params = [
        title,
        author,
        price,
        discount_price || null,
        stock,
        description,
        technical_details,
        category_id,
        is_editors_choice,
        bookId,
      ];
    }

    await db.query(query, params);
    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id = $1", [req.params.id]);
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, full_name AS username, email, role, created_at FROM users ORDER BY created_at DESC",
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, dan password wajib diisi" });
  }
  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4)",
      [username, email, hashedPassword, role || "user"],
    );
    res.status(201).json({ message: "User berhasil dibuat" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const userId = req.params.id;
  if (!username || !email) {
    return res.status(400).json({ message: "Username dan email wajib diisi" });
  }
  try {
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [email, userId],
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Email sudah digunakan user lain" });
    }
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE users SET full_name = $1, email = $2, password = $3, role = $4 WHERE id = $5",
        [username, email, hashedPassword, role || "user", userId],
      );
    } else {
      await db.query(
        "UPDATE users SET full_name = $1, email = $2, role = $3 WHERE id = $4",
        [username, email, role || "user", userId],
      );
    }
    res.status(200).json({ message: "User berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    await db.query("UPDATE users SET role = $1 WHERE id = $2", [
      role,
      req.params.id,
    ]);
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId) === req.userId) {
      return res.status(400).json({
        message: "You cannot revoke your own administrative account access.",
      });
    }
    await db.query("DELETE FROM users WHERE id = $1", [userId]);
    res
      .status(200)
      .json({ message: "User successfully purged from archives." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
