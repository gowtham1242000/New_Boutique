const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Category = require('./Categories');
const Colour = require('./Colours')
const banner = sequelize.define('Banners', {

  name:DataTypes.STRING,
  image:DataTypes.STRING,
  //categoriesId:DataTypes.INTEGER,
  //productId:DataTypes.INTEGER,
  //description:DataTypes.STRING
  percentage:DataTypes.STRING

});

//banner.belongsTo(Category, { foreignKey: 'categoriesId', targetKey: 'id' });
//banner.belongsTo(Colour, { foreignKey: 'productId', targetKey: 'id' });

module.exports = banner;
