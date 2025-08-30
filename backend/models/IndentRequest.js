const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member'); // Adjust the path as necessary

const IndentRequest = sequelize.define('IndentRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'members',
      key: 'id'
    }
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('initiated', 'pending', 'approved', 'rejected', 'partial'),
    defaultValue: 'pending'
  },
  requested_by: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  requested_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  approved_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'indent_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['member_id']
    },
    {
      fields: ['department']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['requested_by']
    },
    {
      fields: ['requested_date']
    },
    {
      fields: ['status', 'priority']
    },
    {
      fields: ['member_id', 'status']
    }
  ]
});

IndentRequest.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = IndentRequest;
