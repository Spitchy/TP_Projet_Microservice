const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Livre = require('./Livre');

const Emprunt = sequelize.define(
  'Emprunt',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dateEmprunt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dateRetourPrevue: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateRetourEffective: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'emprunts',
    timestamps: true,
  }
);

// Establish associations
User.hasMany(Emprunt, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Emprunt.belongsTo(User, { foreignKey: 'UserId' });

Emprunt.belongsTo(Livre, { foreignKey: 'LivreId' });
Livre.hasMany(Emprunt, { foreignKey: 'LivreId', onDelete: 'CASCADE' });

module.exports = Emprunt;
