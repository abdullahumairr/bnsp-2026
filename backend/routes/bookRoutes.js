const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

// Endpoint Katalog Buku (Dapat diakses User setelah login untuk Home & Explore)
router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);

module.exports = router;
