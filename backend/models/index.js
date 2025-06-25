
const { sequelize } = require('../config/database');

// Import all models
const LoginUser = require('./LoginUser');
const Member = require('./Member');
const Transaction = require('./Transaction');
const Purchase = require('./Purchase');
const Issue = require('./Issue');
const IndentRequest = require('./IndentRequest');
const IndentRequestItem = require('./IndentRequestItem');

// Define associations
const defineAssociations = () => {
  // Member associations
  Member.hasMany(Transaction, { foreignKey: 'member_id', as: 'transactions' });
  Transaction.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

  // Transaction associations
  Transaction.hasMany(Purchase, { foreignKey: 'transaction_id', as: 'purchases' });
  Purchase.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });

  Transaction.hasMany(Issue, { foreignKey: 'transaction_id', as: 'issues' });
  Issue.belongsTo(Transaction, { foreignKey: 'transaction_id', as: 'transaction' });

  // Purchase-Issue FIFO relationship
  Purchase.hasMany(Issue, { foreignKey: 'purchase_id', as: 'issues' });
  Issue.belongsTo(Purchase, { foreignKey: 'purchase_id', as: 'purchase' });

  // Member-Issue direct relationship
  Member.hasMany(Issue, { foreignKey: 'member_id', as: 'issues' });
  Issue.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

  // Indent Request associations
  IndentRequest.hasMany(IndentRequestItem, { foreignKey: 'indent_request_id', as: 'items' });
  IndentRequestItem.belongsTo(IndentRequest, { foreignKey: 'indent_request_id', as: 'indentRequest' });
};

defineAssociations();

module.exports = {
  sequelize,
  LoginUser,
  Member,
  Transaction,
  Purchase,
  Issue,
  IndentRequest,
  IndentRequestItem
};
