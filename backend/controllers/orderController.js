const db = require("../config/db");

exports.checkout = async (req, res) => {
  const { cartItems, totalAmount, shippingDetails } = req.body;
  const userId = req.userId;

  if (!cartItems || cartItems.length === 0 || !shippingDetails) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  // PostgreSQL menggunakan client dari pool untuk transaction
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO transactions 
        (user_id, total_amount, full_name, shipping_address, city, postal_code, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')
       RETURNING id`,
      [
        userId,
        totalAmount,
        shippingDetails.fullName,
        shippingDetails.shippingAddress,
        shippingDetails.city,
        shippingDetails.postalCode,
      ],
    );

    const transactionId = orderResult.rows[0].id;

    for (const item of cartItems) {
      await client.query(
        `INSERT INTO transaction_items (transaction_id, book_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [transactionId, item.book_id, item.quantity, item.price],
      );

      await client.query(`UPDATE books SET stock = stock - $1 WHERE id = $2`, [
        item.quantity,
        item.book_id,
      ]);
    }

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      message: "Order berhasil",
      orderId: transactionId,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada transaksi" });
  } finally {
    client.release();
  }
};
