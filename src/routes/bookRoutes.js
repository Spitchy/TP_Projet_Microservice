const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * PUBLIC ROUTES
 */
// GET all books
router.get('/', bookController.getAllBooks);

// GET book by ID
router.get('/:id', bookController.getBookById);

// SEARCH books
router.get('/search/query', bookController.searchBooks);

/**
 * PROTECTED ROUTES
 */
// CREATE a new book
router.post('/', authMiddleware, bookController.createBook);

// UPDATE a book
router.put('/:id', authMiddleware, bookController.updateBook);

// DELETE a book
router.delete('/:id', authMiddleware, bookController.deleteBook);

// BORROW a book
router.post('/:id/borrow', authMiddleware, bookController.borrowBook);

// RETURN a book
router.post('/:id/return', authMiddleware, bookController.returnBook);

module.exports = router;
