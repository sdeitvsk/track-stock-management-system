const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const Products = sequelize.define('products', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_name: {
    type: DataTypes.STRING,
    allowNull: false
  } 
});

module.exports = Products;