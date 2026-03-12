/**
 * Book Service Layer
 * Contains all business logic for book operations
 */

const { Op } = require('sequelize');
const Livre = require('../models/Livre');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { withDbMetrics, recordBookBorrowed, recordBookReturned } = require('../middlewares/metricsMiddleware');

/**
 * Get all books with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.size - Page size (default: 10)
 * @param {string} options.sort - Sort field (default: 'createdAt')
 * @param {string} options.order - Sort order 'asc' or 'desc' (default: 'desc')
 * @param {string} options.titre - Filter by title
 * @param {string} options.auteur - Filter by author
 * @param {boolean} options.disponibilite - Filter by availability
 * @returns {Object} - Paginated books data
 */
const getAllBooks = async (options = {}) => {
  const {
    page = 1,
    size = 10,
    sort = 'createdAt',
    order = 'desc',
    titre,
    auteur,
    disponibilite,
  } = options;

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(size, 10) || 10));
  const offset = (pageNum - 1) * pageSize;

  // Build where clause
  const where = {};
  if (titre) {
    where.titre = { [Op.iLike]: `%${titre}%` };
  }
  if (auteur) {
    where.auteur = { [Op.iLike]: `%${auteur}%` };
  }
  if (disponibilite !== undefined) {
    where.disponibilite = disponibilite === 'true' || disponibilite === true;
  }

  // Validate sort field
  const allowedSortFields = ['id', 'titre', 'auteur', 'isbn', 'disponibilite', 'createdAt', 'updatedAt'];
  const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  logger.info('Fetching books with pagination', { page: pageNum, size: pageSize, sort: sortField, order: sortOrder });

  const { count, rows } = await withDbMetrics('SELECT', 'livres', () =>
    Livre.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [[sortField, sortOrder]],
    })
  );

  const totalPages = Math.ceil(count / pageSize);

  return {
    books: rows,
    pagination: {
      currentPage: pageNum,
      pageSize,
      totalItems: count,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
};

/**
 * Get a book by ID
 * @param {number} id - Book ID
 * @returns {Object} - Book data
 * @throws {AppError} - 404 if book not found
 */
const getBookById = async (id) => {
  const bookId = parseInt(id, 10);
  
  if (isNaN(bookId) || bookId <= 0) {
    throw AppError.badRequest('Invalid book ID');
  }

  logger.info('Fetching book by ID', { bookId });

  const book = await withDbMetrics('SELECT', 'livres', () => Livre.findByPk(bookId));

  if (!book) {
    logger.warn('Book not found', { bookId });
    throw AppError.notFound(`Book with ID ${bookId} not found`);
  }

  return book;
};

/**
 * Create a new book
 * @param {Object} bookData - Book data
 * @param {string} bookData.titre - Book title
 * @param {string} bookData.auteur - Author name
 * @param {string} bookData.isbn - ISBN number
 * @param {boolean} bookData.disponibilite - Availability status
 * @returns {Object} - Created book
 * @throws {AppError} - 400 for validation errors, 409 if ISBN exists
 */
const createBook = async (bookData) => {
  const { titre, auteur, isbn, disponibilite = true } = bookData;

  // Validate required fields
  if (!titre || !titre.trim()) {
    throw AppError.badRequest('Title (titre) is required');
  }
  if (!auteur || !auteur.trim()) {
    throw AppError.badRequest('Author (auteur) is required');
  }
  if (!isbn || !isbn.trim()) {
    throw AppError.badRequest('ISBN is required');
  }

  // Validate ISBN format (basic validation)
  const isbnClean = isbn.replace(/[-\s]/g, '');
  if (!/^(\d{10}|\d{13})$/.test(isbnClean)) {
    throw AppError.badRequest('ISBN must be 10 or 13 digits');
  }

  // Check for duplicate ISBN
  const existingBook = await withDbMetrics('SELECT', 'livres', () => Livre.findOne({ where: { isbn } }));
  if (existingBook) {
    logger.warn('Duplicate ISBN attempted', { isbn });
    throw AppError.conflict(`Book with ISBN ${isbn} already exists`);
  }

  logger.info('Creating new book', { titre, auteur, isbn });

  const book = await withDbMetrics('INSERT', 'livres', () =>
    Livre.create({
      titre: titre.trim(),
      auteur: auteur.trim(),
      isbn: isbn.trim(),
      disponibilite,
    })
  );

  logger.info('Book created successfully', { bookId: book.id });

  return book;
};

/**
 * Update a book by ID
 * @param {number} id - Book ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated book
 * @throws {AppError} - 404 if book not found, 400 for validation errors, 409 if ISBN conflict
 */
const updateBook = async (id, updateData) => {
  const book = await getBookById(id);

  const { titre, auteur, isbn, disponibilite } = updateData;

  // Validate fields if provided
  if (titre !== undefined && !titre.trim()) {
    throw AppError.badRequest('Title (titre) cannot be empty');
  }
  if (auteur !== undefined && !auteur.trim()) {
    throw AppError.badRequest('Author (auteur) cannot be empty');
  }

  // Check ISBN uniqueness if being updated
  if (isbn && isbn !== book.isbn) {
    const isbnClean = isbn.replace(/[-\s]/g, '');
    if (!/^(\d{10}|\d{13})$/.test(isbnClean)) {
      throw AppError.badRequest('ISBN must be 10 or 13 digits');
    }

    const existingBook = await withDbMetrics('SELECT', 'livres', () => Livre.findOne({ where: { isbn } }));
    if (existingBook && existingBook.id !== book.id) {
      throw AppError.conflict(`Book with ISBN ${isbn} already exists`);
    }
  }

  logger.info('Updating book', { bookId: id, updateData });

  // Update only provided fields
  if (titre !== undefined) book.titre = titre.trim();
  if (auteur !== undefined) book.auteur = auteur.trim();
  if (isbn !== undefined) book.isbn = isbn.trim();
  if (disponibilite !== undefined) book.disponibilite = disponibilite;

  await withDbMetrics('UPDATE', 'livres', () => book.save());

  logger.info('Book updated successfully', { bookId: book.id });

  return book;
};

/**
 * Delete a book by ID
 * @param {number} id - Book ID
 * @returns {Object} - Deleted book data
 * @throws {AppError} - 404 if book not found
 */
const deleteBook = async (id) => {
  const book = await getBookById(id);

  logger.info('Deleting book', { bookId: id });

  const bookData = book.toJSON();
  await withDbMetrics('DELETE', 'livres', () => book.destroy());

  logger.info('Book deleted successfully', { bookId: id });

  return bookData;
};

/**
 * Search books by title or author
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.q - Search query
 * @param {number} searchParams.page - Page number
 * @param {number} searchParams.size - Page size
 * @returns {Object} - Paginated search results
 */
const searchBooks = async (searchParams = {}) => {
  const { q, page = 1, size = 10 } = searchParams;

  if (!q || !q.trim()) {
    throw AppError.badRequest('Search query (q) is required');
  }

  const searchQuery = q.trim();
  
  logger.info('Searching books', { query: searchQuery });

  return getAllBooks({
    page,
    size,
    titre: searchQuery,
    auteur: searchQuery,
  });
};

/**
 * Borrow a book
 * @param {number} id - Book ID
 * @param {number} userId - User ID borrowing the book
 * @returns {Object} - Updated book
 * @throws {AppError} - 404 if book not found, 409 if already borrowed
 */
const borrowBook = async (id, userId) => {
  const book = await getBookById(id);

  if (!book.disponibilite) {
    logger.warn('Book already borrowed', { bookId: id });
    throw AppError.conflict(`Book "${book.titre}" is already borrowed`);
  }

  logger.info('Borrowing book', { bookId: id, userId });

  book.disponibilite = false;
  await withDbMetrics('UPDATE', 'livres', () => book.save());
  recordBookBorrowed();

  logger.info('Book borrowed successfully', { bookId: id, userId });

  return book;
};

/**
 * Return a book
 * @param {number} id - Book ID
 * @param {number} userId - User ID returning the book
 * @returns {Object} - Updated book
 * @throws {AppError} - 404 if book not found, 409 if not borrowed
 */
const returnBook = async (id, userId) => {
  const book = await getBookById(id);

  if (book.disponibilite) {
    logger.warn('Book not currently borrowed', { bookId: id });
    throw AppError.conflict(`Book "${book.titre}" is not currently borrowed`);
  }

  logger.info('Returning book', { bookId: id, userId });

  book.disponibilite = true;
  await withDbMetrics('UPDATE', 'livres', () => book.save());
  recordBookReturned();

  logger.info('Book returned successfully', { bookId: id, userId });

  return book;
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
