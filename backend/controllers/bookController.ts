import { Request, Response } from "express";
import pool from "../config/db";

export const getAllBooks = async (req: Request, res: Response) => {
  const { search, category, limit = "12", offset = "0" } = req.query;
  try {
    let query = `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category && category !== "All Works") {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [books] = await pool.query(query, params);
    const [categories] = await pool.query("SELECT * FROM categories");

    res.json({ books, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`,
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Book not found" });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
