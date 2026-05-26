const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  // Debugging: Cek apakah secret key terbaca di file ini
  console.log(
    "JWT_SECRET di middleware:",
    process.env.JWT_SECRET ? "Tersedia" : "KOSONG/UNDEFINED",
  );

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Debugging: Cetak jenis eror JWT asli di terminal backend
      console.error("Eror Verifikasi JWT:", err.message);
      return res
        .status(401)
        .json({ message: "Unauthorized access", error: err.message });
    }

    // Debugging: Cek apakah data id dan role benar-benar ada di dalam token
    console.log("Isi data Token (Decoded):", decoded);

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  console.log("Mengecek Role Admin. Role saat ini:", req.userRole);
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Require Admin Role!" });
  }
  next();
};
