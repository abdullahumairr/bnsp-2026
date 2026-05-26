import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { getAllBooks, getBookById } from '../controllers/bookController';
import { checkout } from '../controllers/orderController';
import { createUserByAdmin, createBook, updateBook, deleteBook, getAllUsers, updateUserByAdmin, deleteUserByAdmin } from '../controllers/adminController';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Public Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/books', getAllBooks);
router.get('/books/:id', getBookById);

router.post('/checkout', verifyToken, checkout);

// ADMIN - CRUD BOOKS
router.post('/admin/books', verifyToken, isAdmin, upload.single('image'), createBook);
router.put('/admin/books/:id', verifyToken, isAdmin, upload.single('image'), updateBook);
router.delete('/admin/books/:id', verifyToken, isAdmin, deleteBook);

// ADMIN - CRUD USERS
router.get('/admin/users', verifyToken, isAdmin, getAllUsers);
router.post('/admin/users', verifyToken, isAdmin, createUserByAdmin);
router.put('/admin/users/:id', verifyToken, isAdmin, updateUserByAdmin);
router.delete('/admin/users/:id', verifyToken, isAdmin, deleteUserByAdmin);

export default router;