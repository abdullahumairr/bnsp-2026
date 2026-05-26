const db = require("../config/db");

// GET /api/cart — Ambil semua item cart milik user
exports.getCart = async (req, res) => {
  const userId = req.userId;
  try {
    const [items] = await db.execute(
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
       WHERE cart.user_id = ?`,
      [userId]
    );

    // Format agar sesuai dengan CartItem interface di frontend
    const formatted = items.map((item) => ({
      id: item.id,           // cart.id (dipakai untuk update/delete)
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

// POST /api/cart — Tambah buku ke cart (jika sudah ada, tambah quantity)
exports.addToCart = async (req, res) => {
  const userId = req.userId;
  const { bookId, quantity = 1 } = req.body;

  if (!bookId) return res.status(400).json({ message: "bookId diperlukan" });

  try {
    // Cek apakah buku sudah ada di cart user ini
    const [existing] = await db.execute(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );

    if (existing.length > 0) {
      // Sudah ada → update quantity (tambahkan)
      await db.execute(
        "UPDATE cart SET quantity = quantity + ? WHERE id = ?",
        [quantity, existing[0].id]
      );
    } else {
      // Belum ada → insert baru
      await db.execute(
        "INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)",
        [userId, bookId, quantity]
      );
    }

    res.status(200).json({ message: "Buku berhasil ditambahkan ke cart" });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ message: "Gagal menambahkan ke cart" });
  }
};

// PUT /api/cart/:id — Update quantity item cart berdasarkan cart.id
exports.updateCart = async (req, res) => {
  const userId = req.userId;
  const cartId = req.params.id;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity tidak valid" });
  }

  try {
    // Pastikan cart item ini milik user yang login
    const [item] = await db.execute(
      "SELECT id FROM cart WHERE id = ? AND user_id = ?",
      [cartId, userId]
    );
    if (item.length === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    await db.execute("UPDATE cart SET quantity = ? WHERE id = ?", [
      quantity,
      cartId,
    ]);
    res.status(200).json({ message: "Quantity berhasil diupdate" });
  } catch (error) {
    console.error("updateCart error:", error);
    res.status(500).json({ message: "Gagal mengupdate cart" });
  }
};

// DELETE /api/cart/:id — Hapus item dari cart berdasarkan cart.id
exports.removeFromCart = async (req, res) => {
  const userId = req.userId;
  const cartId = req.params.id;

  try {
    const [item] = await db.execute(
      "SELECT id FROM cart WHERE id = ? AND user_id = ?",
      [cartId, userId]
    );
    if (item.length === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    await db.execute("DELETE FROM cart WHERE id = ?", [cartId]);
    res.status(200).json({ message: "Item berhasil dihapus dari cart" });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ message: "Gagal menghapus item" });
  }
};

// DELETE /api/cart — Hapus semua item cart milik user (dipanggil setelah checkout)
exports.clearCart = async (req, res) => {
  const userId = req.userId;
  try {
    await db.execute("DELETE FROM cart WHERE user_id = ?", [userId]);
    res.status(200).json({ message: "Cart berhasil dikosongkan" });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ message: "Gagal mengosongkan cart" });
  }
};
