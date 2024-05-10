const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Category = require('./Categories');
const Colour = require('./Colours');
const Product = require('./Products');
const User = require('./Users');

  const order = sequelize.define('Orders', {
  order_Id:DataTypes.STRING,
  order_Status:DataTypes.STRING,
  user_Id:DataTypes.INTEGER,
  product_Id:DataTypes.INTEGER,
  price:DataTypes.INTEGER,
  quantity:DataTypes.INTEGER,
  status:DataTypes.INTEGER
});

order.belongsTo(Product, { foreignKey: 'product_Id', targetKey: 'id' });
order.belongsTo(User, { foreignKey: 'user_Id', targetKey: 'id' });

module.exports = order;