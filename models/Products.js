const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Category = require('./Categories');
const Colour = require('./Colours')
const product = sequelize.define('Products', {

  
  name:DataTypes.STRING,
  code:DataTypes.STRING,
  categories:DataTypes.STRING,
  categoriesId:DataTypes.INTEGER,
  description:DataTypes.STRING,
  sellingPrice:DataTypes.INTEGER,
  status:DataTypes.BOOLEAN

});

product.belongsTo(Category, { foreignKey: 'categoriesId', targetKey: 'id' });
// product.belongsTo(Colour, { foreignKey: 'colourId', targetKey: 'id' });

module.exports = product;