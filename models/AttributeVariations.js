// Import necessary modules
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Import your Sequelize instance
const Product = require('./Products'); // Import the Product model
const Size = require('./Size');
const Colour = require('./Colours');

// Define the AttributeVariation model
const AttributeVariations  = sequelize.define('AttributeVariation', {
    colourId:  DataTypes.INTEGER,
    sizeId: DataTypes.INTEGER,
    ProductId:  DataTypes.INTEGER,
});

AttributeVariations .belongsTo(Size, { foreignKey: 'sizeId', targetKey: 'id' });
AttributeVariations.belongsTo(Product,{ foreignKey:'ProductId', targetKey:'id'});
AttributeVariations.belongsTo(Colour, { foreignKey:'colourId', targetKey:'id'});
// Export the AttributeVariation model
module.exports = AttributeVariations ;


