const db = require('../config/db');

exports.checkout = async (req, res) => {
  const { total_amount, tax, shipping_fee, full_name, shipping_address, city, postal_code, items } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [order] = await connection.execute(
      `INSERT INTO transactions (user_id, total_amount, tax, shipping_fee, full_name, shipping_address, city, postal_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [req.userId, total_amount, tax, shipping_fee, full_name, shipping_address, city, postal_code]
    );

    const transactionId = order.insertId;

    for (let item of items) {
      await connection.execute(
        `INSERT INTO transaction_items (transaction_id, book_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [transactionId, item.id, item.quantity, item.price]
      );
      // Potong Stok
      await connection.execute(
        `UPDATE books SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.id]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Purchase processed successfully', transactionId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};