const db = require("../config/db");

exports.getCart = async (req, res) => {
  const userId = req.userId;
  try {
    const result = await db.query(
      `SELECT 
        cart.id,
        cart.quantity,
        books.id AS book_id,
        books.title,
        books.author,
        books.price,
        books.discount_price,
        books.image_url
       FROM cart
       JOIN books ON cart.book_id = books.id
       WHERE cart.user_id = $1`,
      [userId],
    );

    const formatted = result.rows.map((item) => ({
      id: item.id,
      book_id: item.book_id,
      title: item.title,
      author: item.author,
      price: item.price,
      discount_price: item.discount_price,
      image_url: item.image_url,
      quantity: item.quantity,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ message: "Gagal mengambil data cart" });
  }
};

exports.addToCart = async (req, res) => {
  const userId = req.userId;
  const { bookId, quantity = 1 } = req.body;

  if (!bookId) return res.status(400).json({ message: "bookId diperlukan" });

  try {
    const existing = await db.query(
      "SELECT id, quantity FROM cart WHERE user_id = $1 AND book_id = $2",
      [userId, bookId],
    );

    if (existing.rows.length > 0) {
      await db.query("UPDATE cart SET quantity = quantity + $1 WHERE id = $2", [
        quantity,
        existing.rows[0].id,
      ]);
    } else {
      await db.query(
        "INSERT INTO cart (user_id, book_id, quantity) VALUES ($1, $2, $3)",
        [userId, bookId, quantity],
      );
    }

    res.status(200).json({ message: "Buku berhasil ditambahkan ke cart" });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ message: "Gagal menambahkan ke cart" });
  }
};

exports.updateCart = async (req, res) => {
  const userId = req.userId;
  const cartId = req.params.id;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity tidak valid" });
  }

  try {
    const item = await db.query(
      "SELECT id FROM cart WHERE id = $1 AND user_id = $2",
      [cartId, userId],
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    await db.query("UPDATE cart SET quantity = $1 WHERE id = $2", [
      quantity,
      cartId,
    ]);
    res.status(200).json({ message: "Quantity berhasil diupdate" });
  } catch (error) {
    console.error("updateCart error:", error);
    res.status(500).json({ message: "Gagal mengupdate cart" });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.userId;
  const cartId = req.params.id;

  try {
    const item = await db.query(
      "SELECT id FROM cart WHERE id = $1 AND user_id = $2",
      [cartId, userId],
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    await db.query("DELETE FROM cart WHERE id = $1", [cartId]);
    res.status(200).json({ message: "Item berhasil dihapus dari cart" });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ message: "Gagal menghapus item" });
  }
};

exports.clearCart = async (req, res) => {
  const userId = req.userId;
  try {
    await db.query("DELETE FROM cart WHERE user_id = $1", [userId]);
    res.status(200).json({ message: "Cart berhasil dikosongkan" });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ message: "Gagal mengosongkan cart" });
  }
};
