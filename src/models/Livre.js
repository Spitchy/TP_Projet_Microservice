const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Livre = sequelize.define(
  'Livre',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    auteur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    disponibilite: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'livres',
    timestamps: true,
  }
);

module.exports = Livre;
