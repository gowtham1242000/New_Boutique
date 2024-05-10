const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const attribute = sequelize.define('Attributes', {
        attribute :DataTypes.STRING,
});

module.exports = attribute;
