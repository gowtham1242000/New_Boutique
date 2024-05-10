// Import necessary modules
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Import your Sequelize instance
const Product = require('./Products'); // Import the Product model

// Define the AttributeVariation model
const productDiscount = sequelize.define('ProductDiscount', {
    minimum_Quantity_Discount:  DataTypes.INTEGER,
    discount_Percentage:  DataTypes.FLOAT,
    ProductId:  DataTypes.INTEGER,
    tax_Percentage:  DataTypes.FLOAT,
    minimum_Quantity_Wholesale:  DataTypes.INTEGER,
    wholesale_Price:  DataTypes.FLOAT,
});

productDiscount.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id' });

// Export the AttributeVariation model
module.exports = productDiscount;
