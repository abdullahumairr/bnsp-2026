import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db';

export const checkout = async (req: AuthRequest, res: Response) => {
  const { full_name, shipping_address, city, postal_code, items, total_amount, tax, shipping_fee } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult]: any = await connection.query(
      `INSERT INTO transactions (user_id, total_amount, tax, shipping_fee, full_name, shipping_address, city, postal_code, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [req.user?.id, total_amount, tax, shipping_fee, full_name, shipping_address, city, postal_code]
    );

    const transactionId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO transaction_items (transaction_id, book_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [transactionId, item.id, item.quantity, item.price]
      );

      await connection.query(
        `UPDATE books SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.id]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Transaction successfully processed', transactionId });
  } catch (err: any) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};