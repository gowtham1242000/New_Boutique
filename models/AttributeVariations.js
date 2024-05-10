// Import necessary modules
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Import your Sequelize instance
const Product = require('./Products'); // Import the Product model
const Size = require('./Size');
const Colour = require('./Colours');

// Define the AttributeVariation model
const attributeVariations  = sequelize.define('AttributeVariation', {
    colourId:  DataTypes.INTEGER,
    sizeId: DataTypes.INTEGER,
    pcs:  DataTypes.INTEGER,
    ProductId:  DataTypes.INTEGER,
    Image:  DataTypes.STRING,
    description:  DataTypes.STRING,
    variationPrice:  DataTypes.FLOAT,
    Stock:  DataTypes.BOOLEAN
});

attributeVariations .belongsTo(Size, { foreignKey: 'sizeId', targetKey: 'id' });
attributeVariations.belongsTo(Product,{ foreignKey:'ProductId', targetKey:'id'});
attributeVariations.belongsTo(Colour, { foreignKey:'colourId', targetKey:'id'});
// Export the AttributeVariation model
module.exports = attributeVariations ;


