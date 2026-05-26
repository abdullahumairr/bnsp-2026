import { Request, Response } from 'express';
import pool from '../config/db';

// DASHBOARD STATS
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [sales]: any = await pool.query('SELECT SUM(total_amount) as total FROM transactions WHERE status="completed"');
    const [books]: any = await pool.query('SELECT COUNT(*) as total FROM books');
    const [users]: any = await pool.query('SELECT COUNT(*) as total FROM users');
    const [recentTx]: any = await pool.query('SELECT t.*, u.full_name FROM transactions t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 5');

    res.json({
      totalSales: sales[0].total || 0,
      totalBooks: books[0].total,
      totalUsers: users[0].total,
      recentTransactions: recentTx
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// CRUD BOOKS
export const createBook = async (req: Request, res: Response) => {
  const { title, author, price, stock, description, technical_details, category_id, is_editors_choice } = req.body;
  const image_url = req.file ? req.file.filename : null;
  try {
    await pool.query(
      `INSERT INTO books (title, author, price, stock, description, technical_details, image_url, category_id, is_editors_choice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, price, stock, description, technical_details, image_url, category_id, is_editors_choice]
    );
    res.status(201).json({ message: 'Book created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const { title, author, price, stock, description, technical_details, category_id, is_editors_choice } = req.body;
  const { id } = req.params;
  let query = `UPDATE books SET title=?, author=?, price=?, stock=?, description=?, technical_details=?, category_id=?, is_editors_choice=?`;
  const params = [title, author, price, stock, description, technical_details, category_id, is_editors_choice];

  if (req.file) {
    query += `, image_url=?`;
    params.push(req.file.filename);
  }
  query += ` WHERE id=?`;
  params.push(id);

  try {
    await pool.query(query, params);
    res.json({ message: 'Book updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// USER MANAGEMENT
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role, created_at FROM users');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  try {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};