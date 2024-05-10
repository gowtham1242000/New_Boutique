const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Attribute =require('./Attributes')
const size = sequelize.define('Sizes', {
  value:DataTypes.STRING,
  attributeId:DataTypes.INTEGER,
});

size.belongsTo(Attribute, { foreignKey: 'attributeId', targetKey: 'id' });

module.exports = size;
