const sequelize = require('../config/database');
const User = require('../models/User');
const Livre = require('../models/Livre');
const logger = require('./logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Sample Users
    const users = await User.bulkCreate(
      [
        {
          nom: 'Alice Dupont',
          email: 'alice@example.com',
          password: 'password123',
          role: 'admin',
        },
        {
          nom: 'Bob Martin',
          email: 'bob@example.com',
          password: 'password123',
          role: 'user',
        },
        {
          nom: 'Charlie Leblanc',
          email: 'charlie@example.com',
          password: 'password123',
          role: 'user',
        },
      ],
      { individualHooks: true, ignoreDuplicates: true }
    );

    logger.info('Created users');

    // Sample Books
    const books = await Livre.bulkCreate(
      [
        {
          titre: 'The Great Gatsby',
          auteur: 'F. Scott Fitzgerald',
          isbn: '978-0743273565',
          disponibilite: true,
        },
        {
          titre: 'To Kill a Mockingbird',
          auteur: 'Harper Lee',
          isbn: '978-0061120084',
          disponibilite: true,
        },
        {
          titre: '1984',
          auteur: 'George Orwell',
          isbn: '978-0451524935',
          disponibilite: false,
        },
        {
          titre: 'Pride and Prejudice',
          auteur: 'Jane Austen',
          isbn: '978-0141439518',
          disponibilite: true,
        },
        {
          titre: 'The Catcher in the Rye',
          auteur: 'J.D. Salinger',
          isbn: '978-0316769174',
          disponibilite: true,
        },
      ],
      { ignoreDuplicates: true }
    );

    logger.info('Created books');
    logger.info('Database seeding completed successfully');

    return true;
  } catch (error) {
    logger.error('Seeding error', { error: error.message });
    return false;
  }
};

module.exports = seedDatabase;
