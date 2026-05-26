import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';

// ==========================================
// 1. MANAGEMENT BOOKS (CRUD SEMUA BUKU)
// ==========================================

export const createBook = async (req: Request, res: Response) => {
  const { title, author, price, stock, description, technical_details, category_id, is_editors_choice } = req.body;
  const image_url = req.file ? req.file.filename : null;
  try {
    await pool.query(
      `INSERT INTO books (title, author, price, stock, description, technical_details, image_url, category_id, is_editors_choice) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, price, stock, description, technical_details, image_url, category_id, is_editors_choice || 0]
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
  const params: any[] = [title, author, price, stock, description, technical_details, category_id, is_editors_choice];

  if (req.file) {
    query += `, image_url=?`;
    params.push(req.file.filename);
  }
  query += ` WHERE id=?`;
  params.push(id);

  try {
    const [result]: any = await pool.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const [result]: any = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


// ==========================================
// 2. MANAGEMENT USERS (CRUD SEMUA USER)
// ==========================================

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createUserByAdmin = async (req: Request, res: Response) => {
  const { full_name, email, password, role } = req.body;
  try {
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, role || 'user']
    );
    res.status(201).json({ message: 'User created successfully by Admin' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserByAdmin = async (req: Request, res: Response) => {
  const { full_name, email, role, password } = req.body;
  const { id } = req.params;
  try {
    let query = `UPDATE users SET full_name=?, email=?, role=?`;
    const params: any[] = [full_name, email, role];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password=?`;
      params.push(hashedPassword);
    }

    query += ` WHERE id=?`;
    params.push(id);

    const [result]: any = await pool.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'User updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUserByAdmin = async (req: Request, res: Response) => {
  try {
    const [result]: any = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted permanently' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};