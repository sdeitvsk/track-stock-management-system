
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IndentRequestItem = sequelize.define('IndentRequestItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  indent_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'indent_requests',
      key: 'id'
    }
  },
  item_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  approved_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  purchase_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'purchases',
      key: 'id'
    }
  }
}, {
  tableName: 'indent_request_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['indent_request_id']
    },
    {
      fields: ['item_name']
    },
    {
      fields: ['quantity']
    },
    {
      fields: ['approved_quantity']
    }
  ]
});

module.exports = IndentRequestItem;
