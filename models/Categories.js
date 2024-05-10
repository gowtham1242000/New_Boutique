const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const categorie = sequelize.define('Categorie', {
  categoriesName:DataTypes.STRING,
  image:DataTypes.STRING
});


module.exports = categorie;