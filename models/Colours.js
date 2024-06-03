const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const colour = sequelize.define('Colour', {
  value:DataTypes.STRING,
  hexCode:DataTypes.STRING,
  attributeId:DataTypes.INTEGER,
  image:DataTypes.STRING,
//  status:DataTypes.BOOLEAN
});


module.exports = colour;
