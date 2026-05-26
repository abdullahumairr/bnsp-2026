const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

exports.register = async (req, res) => {
  // Menerima data dari frontend
  const { username, email, password, role } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Menyimpan dengan field 'full_name' sesuai tabel database
    await db.execute(
      "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role || "user"],
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error); // Log untuk debug
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(401).json({ message: "User not found" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "SUPER_SECRET_KEY_2026",
      { expiresIn: "24h" },
    );
    res.status(200).json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, full_name, email, role FROM users WHERE id = ?",
      [req.userId],
    );
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
