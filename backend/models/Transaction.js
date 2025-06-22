
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('purchase', 'issue'),
    allowNull: false
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'members',
      key: 'id'
    }
  },
  invoice_no: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  invoice_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'transactions'
});

module.exports = Transaction;
