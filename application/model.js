const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with PostgreSQL database details
const sequelize = new Sequelize('postgres://postgres:mysecretpassword@localhost:5432/postgres');

// Define User model
const Record = sequelize.define('Record', {
  id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  passport: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  certificate: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

// Export Record model
module.exports = Record;