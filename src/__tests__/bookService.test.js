/**
 * Book Service Unit Tests
 * Tests business logic in bookService.js
 */

const bookService = require('../services/bookService');
const Livre = require('../models/Livre');
const AppError = require('../utils/AppError');

// Mock the Livre model
jest.mock('../models/Livre');

// Mock the logger to prevent console output during tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should return paginated books with default parameters', async () => {
      const mockBooks = [
        { id: 1, titre: 'Book 1', auteur: 'Author 1', isbn: '1234567890', disponibilite: true },
        { id: 2, titre: 'Book 2', auteur: 'Author 2', isbn: '0987654321', disponibilite: false },
      ];

      Livre.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockBooks,
      });

      const result = await bookService.getAllBooks({});

      expect(Livre.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(result.books).toEqual(mockBooks);
      expect(result.pagination).toEqual({
        currentPage: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle pagination parameters correctly', async () => {
      Livre.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: [],
      });

      const result = await bookService.getAllBooks({ page: 2, size: 5 });

      expect(Livre.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 5,
        })
      );
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.pageSize).toBe(5);
      expect(result.pagination.totalPages).toBe(10);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should apply filters correctly', async () => {
      Livre.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, titre: 'Test Book', auteur: 'Test Author' }],
      });

      await bookService.getAllBooks({ 
        titre: 'Test',
        auteur: 'Author',
        disponibilite: 'true'
      });

      expect(Livre.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            disponibilite: true,
          }),
        })
      );
    });

    it('should handle invalid page numbers gracefully', async () => {
      Livre.findAndCountAll.mockResolvedValue({
        count: 10,
        rows: [],
      });

      const result = await bookService.getAllBooks({ page: -1, size: 0 });

      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.pageSize).toBe(10); // defaults to 10 when invalid
    });

    it('should limit maximum page size to 100', async () => {
      Livre.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      });

      await bookService.getAllBooks({ size: 500 });

      expect(Livre.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
        })
      );
    });
  });

  describe('getBookById', () => {
    it('should return a book when found', async () => {
      const mockBook = {
        id: 1,
        titre: 'Test Book',
        auteur: 'Test Author',
        isbn: '1234567890',
        disponibilite: true,
      };

      Livre.findByPk.mockResolvedValue(mockBook);

      const result = await bookService.getBookById(1);

      expect(Livre.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it('should throw 404 error when book not found', async () => {
      Livre.findByPk.mockResolvedValue(null);

      await expect(bookService.getBookById(999)).rejects.toThrow(AppError);
      await expect(bookService.getBookById(999)).rejects.toMatchObject({
        statusCode: 404,
        message: expect.stringContaining('not found'),
      });
    });

    it('should throw 400 error for invalid ID', async () => {
      await expect(bookService.getBookById('invalid')).rejects.toThrow(AppError);
      await expect(bookService.getBookById('invalid')).rejects.toMatchObject({
        statusCode: 400,
        message: 'Invalid book ID',
      });
    });

    it('should throw 400 error for negative ID', async () => {
      await expect(bookService.getBookById(-1)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Invalid book ID',
      });
    });
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const bookData = {
        titre: 'New Book',
        auteur: 'New Author',
        isbn: '1234567890123',
        disponibilite: true,
      };

      const mockCreatedBook = { id: 1, ...bookData };

      Livre.findOne.mockResolvedValue(null);
      Livre.create.mockResolvedValue(mockCreatedBook);

      const result = await bookService.createBook(bookData);

      expect(Livre.create).toHaveBeenCalledWith({
        titre: 'New Book',
        auteur: 'New Author',
        isbn: '1234567890123',
        disponibilite: true,
      });
      expect(result).toEqual(mockCreatedBook);
    });

    it('should throw 400 error when titre is missing', async () => {
      await expect(
        bookService.createBook({ auteur: 'Author', isbn: '1234567890' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Title (titre) is required',
      });
    });

    it('should throw 400 error when auteur is missing', async () => {
      await expect(
        bookService.createBook({ titre: 'Title', isbn: '1234567890' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Author (auteur) is required',
      });
    });

    it('should throw 400 error when isbn is missing', async () => {
      await expect(
        bookService.createBook({ titre: 'Title', auteur: 'Author' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'ISBN is required',
      });
    });

    it('should throw 400 error for invalid ISBN format', async () => {
      await expect(
        bookService.createBook({ titre: 'Title', auteur: 'Author', isbn: '123' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'ISBN must be 10 or 13 digits',
      });
    });

    it('should throw 409 error when ISBN already exists', async () => {
      Livre.findOne.mockResolvedValue({ id: 1, isbn: '1234567890' });

      await expect(
        bookService.createBook({ titre: 'Title', auteur: 'Author', isbn: '1234567890' })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('already exists'),
      });
    });

    it('should trim whitespace from input values', async () => {
      const bookData = {
        titre: '  Trimmed Title  ',
        auteur: '  Trimmed Author  ',
        isbn: '1234567890',
      };

      Livre.findOne.mockResolvedValue(null);
      Livre.create.mockResolvedValue({ id: 1 });

      await bookService.createBook(bookData);

      expect(Livre.create).toHaveBeenCalledWith({
        titre: 'Trimmed Title',
        auteur: 'Trimmed Author',
        isbn: '1234567890',
        disponibilite: true,
      });
    });
  });

  describe('updateBook', () => {
    const existingBook = {
      id: 1,
      titre: 'Old Title',
      auteur: 'Old Author',
      isbn: '1234567890',
      disponibilite: true,
      save: jest.fn(),
      toJSON: jest.fn(),
    };

    beforeEach(() => {
      existingBook.save.mockClear();
    });

    it('should update book successfully', async () => {
      Livre.findByPk.mockResolvedValue(existingBook);
      existingBook.save.mockResolvedValue(existingBook);

      const result = await bookService.updateBook(1, { titre: 'New Title' });

      expect(existingBook.titre).toBe('New Title');
      expect(existingBook.save).toHaveBeenCalled();
    });

    it('should throw 404 error when book not found', async () => {
      Livre.findByPk.mockResolvedValue(null);

      await expect(
        bookService.updateBook(999, { titre: 'New Title' })
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw 400 error for empty titre', async () => {
      Livre.findByPk.mockResolvedValue(existingBook);

      await expect(
        bookService.updateBook(1, { titre: '   ' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Title (titre) cannot be empty',
      });
    });

    it('should throw 409 error when updating to existing ISBN', async () => {
      Livre.findByPk.mockResolvedValue(existingBook);
      Livre.findOne.mockResolvedValue({ id: 2, isbn: '0987654321' });

      await expect(
        bookService.updateBook(1, { isbn: '0987654321' })
      ).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it('should allow updating to same ISBN', async () => {
      Livre.findByPk.mockResolvedValue(existingBook);
      Livre.findOne.mockResolvedValue(null);
      existingBook.save.mockResolvedValue(existingBook);

      await bookService.updateBook(1, { isbn: '1234567890' });

      expect(existingBook.save).toHaveBeenCalled();
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      const mockBook = {
        id: 1,
        titre: 'Book to Delete',
        toJSON: jest.fn().mockReturnValue({ id: 1, titre: 'Book to Delete' }),
        destroy: jest.fn(),
      };

      Livre.findByPk.mockResolvedValue(mockBook);

      const result = await bookService.deleteBook(1);

      expect(mockBook.destroy).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, titre: 'Book to Delete' });
    });

    it('should throw 404 error when book not found', async () => {
      Livre.findByPk.mockResolvedValue(null);

      await expect(bookService.deleteBook(999)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('searchBooks', () => {
    it('should search books by query', async () => {
      Livre.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, titre: 'Matching Book' }],
      });

      const result = await bookService.searchBooks({ q: 'Matching' });

      expect(result.books).toHaveLength(1);
    });

    it('should throw 400 error when query is missing', async () => {
      await expect(bookService.searchBooks({})).rejects.toMatchObject({
        statusCode: 400,
        message: 'Search query (q) is required',
      });
    });

    it('should throw 400 error for empty query', async () => {
      await expect(bookService.searchBooks({ q: '   ' })).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('borrowBook', () => {
    it('should borrow an available book', async () => {
      const mockBook = {
        id: 1,
        titre: 'Available Book',
        disponibilite: true,
        save: jest.fn(),
      };

      Livre.findByPk.mockResolvedValue(mockBook);

      const result = await bookService.borrowBook(1, 123);

      expect(mockBook.disponibilite).toBe(false);
      expect(mockBook.save).toHaveBeenCalled();
    });

    it('should throw 404 error when book not found', async () => {
      Livre.findByPk.mockResolvedValue(null);

      await expect(bookService.borrowBook(999, 123)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw 409 error when book is already borrowed', async () => {
      const mockBook = {
        id: 1,
        titre: 'Borrowed Book',
        disponibilite: false,
      };

      Livre.findByPk.mockResolvedValue(mockBook);

      await expect(bookService.borrowBook(1, 123)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('already borrowed'),
      });
    });
  });

  describe('returnBook', () => {
    it('should return a borrowed book', async () => {
      const mockBook = {
        id: 1,
        titre: 'Borrowed Book',
        disponibilite: false,
        save: jest.fn(),
      };

      Livre.findByPk.mockResolvedValue(mockBook);

      const result = await bookService.returnBook(1, 123);

      expect(mockBook.disponibilite).toBe(true);
      expect(mockBook.save).toHaveBeenCalled();
    });

    it('should throw 404 error when book not found', async () => {
      Livre.findByPk.mockResolvedValue(null);

      await expect(bookService.returnBook(999, 123)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw 409 error when book is not borrowed', async () => {
      const mockBook = {
        id: 1,
        titre: 'Available Book',
        disponibilite: true,
      };

      Livre.findByPk.mockResolvedValue(mockBook);

      await expect(bookService.returnBook(1, 123)).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('not currently borrowed'),
      });
    });
  });
});
