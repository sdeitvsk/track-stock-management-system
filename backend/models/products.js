const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const Products = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  } 
});

module.exports = Products;