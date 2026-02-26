/**
 * Book Controller
 * Handles HTTP requests for book-related operations
 */

const bookService = require('../services/bookService');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

/**
 * GET /api/v1/books
 * Get all books with pagination and filtering
 */
const getAllBooks = async (req, res, next) => {
  try {
    const { page, size, sort, order, titre, auteur, disponibilite } = req.query;
    
    const result = await bookService.getAllBooks({
      page,
      size,
      sort,
      order,
      titre,
      auteur,
      disponibilite,
    });

    return paginatedResponse(res, {
      data: result.books,
      message: 'Books retrieved successfully',
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/books/:id
 * Get book by ID
 */
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await bookService.getBookById(id);

    return successResponse(res, {
      data: book,
      message: 'Book retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/books
 * Create a new book (authenticated)
 */
const createBook = async (req, res, next) => {
  try {
    const { titre, auteur, isbn, disponibilite } = req.body;
    
    const book = await bookService.createBook({
      titre,
      auteur,
      isbn,
      disponibilite,
    });

    return successResponse(res, {
      data: book,
      message: 'Book created successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/books/:id
 * Update a book (authenticated)
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titre, auteur, isbn, disponibilite } = req.body;
    
    const book = await bookService.updateBook(id, {
      titre,
      auteur,
      isbn,
      disponibilite,
    });

    return successResponse(res, {
      data: book,
      message: 'Book updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/books/:id
 * Delete a book (authenticated)
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await bookService.deleteBook(id);

    return successResponse(res, {
      data: book,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/books/search
 * Search books by title or author
 */
const searchBooks = async (req, res, next) => {
  try {
    const { q, page, size } = req.query;
    
    const result = await bookService.searchBooks({ q, page, size });

    return paginatedResponse(res, {
      data: result.books,
      message: 'Search results retrieved successfully',
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/books/:id/borrow
 * Borrow a book (authenticated)
 */
const borrowBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const book = await bookService.borrowBook(id, userId);

    return successResponse(res, {
      data: book,
      message: 'Book borrowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/books/:id/return
 * Return a book (authenticated)
 */
const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const book = await bookService.returnBook(id, userId);

    return successResponse(res, {
      data: book,
      message: 'Book returned successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  borrowBook,
  returnBook,
};
