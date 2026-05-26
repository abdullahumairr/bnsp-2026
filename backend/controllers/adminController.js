const db = require("../config/db");
const bcrypt = require("bcryptjs");

// --- DASHBOARD METRICS ---
exports.getDashboardMetrics = async (req, res) => {
  try {
    const [[sales]] = await db.query(
      'SELECT SUM(total_amount) as total FROM transactions WHERE status="completed"',
    );
    const [[books]] = await db.query(
      "SELECT SUM(stock) as total_stock FROM books",
    );
    const [[users]] = await db.query(
      "SELECT COUNT(id) as total_users FROM users",
    );

    // ✅ Ambil SEMUA transaksi, bukan hanya 3
    const [allTransactions] = await db.query(`
      SELECT 
        t.id,
        t.total_amount,
        t.status,
        t.created_at,
        t.full_name,
        t.city,
        GROUP_CONCAT(b.title SEPARATOR ', ') AS books_title
      FROM transactions t 
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN books b ON ti.book_id = b.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.status(200).json({
      totalSales: sales.total || 0,
      totalBooks: books.total_stock || 0,
      totalUsers: users.total_users || 0,
      recentTransactions: allTransactions,
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
  const image_url = req.file ? req.file.filename : null;
  try {
    await db.execute(
      `INSERT INTO books (title, author, price, discount_price, stock, description, technical_details, image_url, category_id, is_editors_choice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        is_editors_choice || 0,
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
    let query = `UPDATE books SET title=?, author=?, price=?, discount_price=?, stock=?, description=?, technical_details=?, category_id=?, is_editors_choice=?`;
    let params = [
      title,
      author,
      price,
      discount_price || null,
      stock,
      description,
      technical_details,
      category_id,
      is_editors_choice,
    ];
    if (req.file) {
      query += `, image_url=?`;
      params.push(req.file.filename);
    }
    query += ` WHERE id=?`;
    params.push(bookId);
    await db.execute(query, params);
    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await db.execute("DELETE FROM books WHERE id = ?", [req.params.id]);
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, full_name AS username, email, role, created_at FROM users ORDER BY created_at DESC",
    );
    res.status(200).json(users);
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
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
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
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Email sudah digunakan user lain" });
    }
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute(
        "UPDATE users SET full_name = ?, email = ?, password = ?, role = ? WHERE id = ?",
        [username, email, hashedPassword, role || "user", userId],
      );
    } else {
      await db.execute(
        "UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?",
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
    await db.execute("UPDATE users SET role = ? WHERE id = ?", [
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
      return res
        .status(400)
        .json({
          message: "You cannot revoke your own administrative account access.",
        });
    }
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    res
      .status(200)
      .json({ message: "User successfully purged from archives." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
