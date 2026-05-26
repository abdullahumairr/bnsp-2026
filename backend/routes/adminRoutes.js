const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(verifyToken, isAdmin);

// Dashboard Metrics
router.get("/metrics", adminController.getDashboardMetrics);

// Books Management (CRUD)
router.post("/books", upload.single("image"), adminController.createBook);
router.put("/books/:id", upload.single("image"), adminController.updateBook);
router.delete("/books/:id", adminController.deleteBook);

// Users Management
router.get("/users", adminController.getAllUsers);
router.post("/users/register", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
