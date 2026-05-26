const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// Endpoint Otentikasi Publik
router.post("/register", authController.register);
router.post("/login", authController.login);

// Endpoint Terproteksi (Butuh Login)
router.get("/profile", verifyToken, authController.getProfile);

module.exports = router;
