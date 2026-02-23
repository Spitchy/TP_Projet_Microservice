const sequelize = require('../config/database');
const User = require('../models/User');
const Livre = require('../models/Livre');
const Emprunt = require('../models/Emprunt');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sample Users
    const users = await User.bulkCreate(
      [
        {
          nom: 'Alice Dupont',
          email: 'alice@example.com',
          role: 'admin',
        },
        {
          nom: 'Bob Martin',
          email: 'bob@example.com',
          role: 'user',
        },
        {
          nom: 'Charlie Leblanc',
          email: 'charlie@example.com',
          role: 'user',
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log('✓ Created users');

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

    console.log('✓ Created books');

    // Sample Emprunts (Borrowing records)
    const today = new Date();
    const returnDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    const emprunts = await Emprunt.bulkCreate(
      [
        {
          UserId: users[0]?.id || 1,
          LivreId: books[0]?.id || 1,
          dateEmprunt: today,
          dateRetourPrevue: returnDate,
          dateRetourEffective: null,
        },
        {
          UserId: users[1]?.id || 2,
          LivreId: books[2]?.id || 3,
          dateEmprunt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          dateRetourPrevue: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          dateRetourEffective: today,
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log('✓ Created borrowing records');
    console.log('✅ Database seeding completed successfully!\n');

    return true;
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    return false;
  }
};

module.exports = seedDatabase;
