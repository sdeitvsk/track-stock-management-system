const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'transactions',
      key: 'id'
    }
  },
  item_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  remaining_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  purchase_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'purchase',
  hooks: {
    beforeCreate: (purchase) => {
      // Set remaining quantity equal to initial quantity
      purchase.remaining_quantity = purchase.quantity;
    }
  }
});

// Instance method to check if purchase is fully consumed
Purchase.prototype.isFullyConsumed = function() {
  return this.remaining_quantity <= 0;
};

// Instance method to get consumed quantity
Purchase.prototype.getConsumedQuantity = function() {
  return this.quantity - this.remaining_quantity;
};

module.exports = Purchase;