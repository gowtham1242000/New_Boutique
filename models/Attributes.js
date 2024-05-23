const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const attribute = sequelize.define('Attributes', {
        attribute :DataTypes.STRING,
	status :DataTypes.BOOLEAN
});

module.exports = attribute;
