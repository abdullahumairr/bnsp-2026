const db = require('../config/db');

// --- DASHBOARD METRICS ---
exports.getDashboardMetrics = async (req, res) => {
  try {
    const [[sales]] = await db.query('SELECT SUM(total_amount) as total FROM transactions WHERE status="completed"');
    const [[books]] = await db.query('SELECT SUM(stock) as total_stock FROM books');
    const [[users]] = await db.query('SELECT COUNT(id) as total_users FROM users');
    
    const [recentTransactions] = await db.query(`
      SELECT t.*, ti.quantity, b.title, b.image_url 
      FROM transactions t 
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN books b ON ti.book_id = b.id
      ORDER BY t.created_at DESC LIMIT 3
    `);

    res.status(200).json({
      totalSales: sales.total || 0,
      totalBooks: books.total_stock || 0,
      totalUsers: users.total_users || 0,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BOOK CRUD ---
exports.createBook = async (req, res) => {
  const { title, author, price, discount_price, stock, description, technical_details, category_id, is_editors_choice } = req.body;
  const image_url = req.file ? req.file.filename : null;
  try {
    await db.execute(
      `INSERT INTO books (title, author, price, discount_price, stock, description, technical_details, image_url, category_id, is_editors_choice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, price, discount_price || null, stock, description, technical_details, image_url, category_id, is_editors_choice || 0]
    );
    res.status(201).json({ message: 'Book created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  const { title, author, price, discount_price, stock, description, technical_details, category_id, is_editors_choice } = req.body;
  const bookId = req.params.id;
  try {
    let query = `UPDATE books SET title=?, author=?, price=?, discount_price=?, stock=?, description=?, technical_details=?, category_id=?, is_editors_choice=?`;
    let params = [title, author, price, discount_price || null, stock, description, technical_details, category_id, is_editors_choice];

    if (req.file) {
      query += `, image_url=?`;
      params.push(req.file.filename);
    }
    query += ` WHERE id=?`;
    params.push(bookId);

    await db.execute(query, params);
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await db.execute('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Cegah admin menghapus dirinya sendiri secara tidak sengaja
    if (parseInt(userId) === req.userId) {
      return res.status(400).json({ message: "You cannot revoke your own administrative account access." });
    }
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    res.status(200).json({ message: 'User successfully purged from archives.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};