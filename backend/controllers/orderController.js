const db = require("../config/db");

exports.checkout = async (req, res) => {
  const { cartItems, totalAmount, shippingDetails } = req.body;
  const userId = req.userId;

  if (!cartItems || cartItems.length === 0 || !shippingDetails) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ Pakai tabel 'transactions' sesuai schema database
    const [orderResult] = await connection.execute(
      `INSERT INTO transactions 
        (user_id, total_amount, full_name, shipping_address, city, postal_code, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'completed')`,
      [
        userId,
        totalAmount,
        shippingDetails.fullName,
        shippingDetails.shippingAddress,
        shippingDetails.city,
        shippingDetails.postalCode,
      ],
    );

    const transactionId = orderResult.insertId;

    for (const item of cartItems) {
      // ✅ Pakai tabel 'transaction_items' + kolom 'book_id' dari cart item
      await connection.execute(
        `INSERT INTO transaction_items (transaction_id, book_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [transactionId, item.book_id, item.quantity, item.price],
      );

      // ✅ Kurangi stok buku
      await connection.execute(
        `UPDATE books SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.book_id],
      );
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Order berhasil",
      orderId: transactionId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada transaksi" });
  } finally {
    connection.release();
  }
};
