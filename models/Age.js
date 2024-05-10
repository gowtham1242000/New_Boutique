const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Attribute =require('./Attributes')
const age = sequelize.define('Ages', {
  value:DataTypes.STRING,
  attributeId:DataTypes.INTEGER,
});

age.belongsTo(Attribute, { foreignKey: 'attributeId', targetKey: 'id' });

module.exports = age;
