const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Category = require('./Categories');
const Colour = require('./Colours');
const Product = require('./Products');
const User = require('./Users');
const CompainAttribute = require('./CompainAttribute')

const order = sequelize.define('Orders', {
  order_Status:DataTypes.STRING,
  order_Type:DataTypes.STRING,
  user_Id:DataTypes.INTEGER,
  product_Id:DataTypes.INTEGER,
  price:DataTypes.INTEGER,
  quantity:DataTypes.INTEGER,
//  status:DataTypes.INTEGER,
  subPrice:DataTypes.INTEGER,
  tax:DataTypes.INTEGER,
  discount:DataTypes.INTEGER,
  compainAttribute_Id:DataTypes.INTEGER,
  customer_name:DataTypes.STRING,
  customer_phonenumber:DataTypes.STRING,
  customer_email:DataTypes.STRING
});

order.belongsTo(Product, { foreignKey: 'product_Id', targetKey: 'id' });
order.belongsTo(User, { foreignKey: 'user_Id', targetKey: 'id' });
order.belongsTo(CompainAttribute, { foreignKey: 'compainAttribute_Id', targetKey:'id'});

module.exports = order;
