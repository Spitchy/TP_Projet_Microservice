const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * PUBLIC ROUTES
 */

// GET /api/v1/books/search - Search books (must be before /:id to avoid conflict)
router.get('/search', bookController.searchBooks);

// GET /api/v1/books - Get all books (paginated)
router.get('/', bookController.getAllBooks);

// GET /api/v1/books/:id - Get book by ID
router.get('/:id', bookController.getBookById);

/**
 * PROTECTED ROUTES (require authentication)
 */

// POST /api/v1/books - Create a new book
router.post('/', authMiddleware, bookController.createBook);

// PUT /api/v1/books/:id - Update a book
router.put('/:id', authMiddleware, bookController.updateBook);

// DELETE /api/v1/books/:id - Delete a book
router.delete('/:id', authMiddleware, bookController.deleteBook);

// POST /api/v1/books/:id/borrow - Borrow a book
router.post('/:id/borrow', authMiddleware, bookController.borrowBook);

// POST /api/v1/books/:id/return - Return a book
router.post('/:id/return', authMiddleware, bookController.returnBook);

module.exports = router;
