const db = require("../config/db");

exports.getAllBooks = async (req, res) => {
  const { search, category, page = 1, limit = 8 } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1`;
  let params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (b.title ILIKE $${paramIndex} OR b.author ILIKE $${paramIndex + 1})`;
    params.push(`%${search}%`, `%${search}%`);
    paramIndex += 2;
  }
  if (category && category !== "All Works") {
    query += ` AND c.name = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(parseInt(limit), parseInt(offset));

  try {
    const booksResult = await db.query(query, params);
    const categoriesResult = await db.query("SELECT * FROM categories");
    res.status(200).json({
      books: booksResult.rows,
      categories: categoriesResult.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const bookResult = await db.query(
      `SELECT b.*, c.name as category_name FROM books b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.id = $1`,
      [req.params.id],
    );
    if (bookResult.rows.length === 0)
      return res.status(404).json({ message: "Book not found" });

    const book = bookResult.rows[0];

    const recResult = await db.query(
      `SELECT * FROM books WHERE category_id = $1 AND id != $2 LIMIT 3`,
      [book.category_id, book.id],
    );

    res.status(200).json({ book, recommendations: recResult.rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
