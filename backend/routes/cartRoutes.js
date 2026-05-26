const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/authMiddleware");

// Semua route cart wajib login (JWT)
router.get("/", verifyToken, cartController.getCart);
router.post("/", verifyToken, cartController.addToCart);
router.put("/:id", verifyToken, cartController.updateCart);
router.delete("/:id", verifyToken, cartController.removeFromCart);
router.delete("/", verifyToken, cartController.clearCart);

module.exports = router;
