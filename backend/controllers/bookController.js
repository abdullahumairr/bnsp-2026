const db = require("../config/db");

exports.getAllBooks = async (req, res) => {
  const { search, category, page = 1, limit = 8 } = req.query;
  const offset = (page - 1) * limit;
  let query = `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1`;
  let params = [];

  if (search) {
    query += ` AND (b.title LIKE ? OR b.author LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category && category !== "All Works") {
    query += ` AND c.name = ?`;
    params.push(category);
  }

  query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [books] = await db.query(query, params);
    const [categories] = await db.query("SELECT * FROM categories");
    res.status(200).json({ books, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const [books] = await db.execute(
      `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`,
      [req.params.id],
    );
    if (books.length === 0)
      return res.status(404).json({ message: "Book not found" });

    // Fetch Recommendations
    const [recommendations] = await db.execute(
      `SELECT * FROM books WHERE category_id = ? AND id != ? LIMIT 3`,
      [books[0].category_id, books[0].id],
    );

    res.status(200).json({ book: books[0], recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
    