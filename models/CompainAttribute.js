const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Product = require('./Products.js');
const Size = require('./Size.js');
const Colour = require('./Colours.js');

const compainAttribute = sequelize.define('CompainAttributes', {
    productId: DataTypes.INTEGER,
    colour_Value_Id: DataTypes.INTEGER, // Change data type to array of integers
    size_Value_Id: DataTypes.INTEGER,
    colour: DataTypes.STRING,
    size: DataTypes.STRING,
    stock: DataTypes.BOOLEAN,
    pcs: DataTypes.INTEGER,
    image: DataTypes.STRING,
    description: DataTypes.STRING,
    variationPrice: DataTypes.INTEGER // Change data type to array of integers
});

// compainAttribute.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id' });
// compainAttribute.belongsTo(Size, { foreignKey: 'size_Value_Id', targetKey: 'id' });
// compainAttribute.belongsTo(Colour, { foreignKey: 'colour_Value_Id', targetKey: 'id' });

module.exports = compainAttribute;





