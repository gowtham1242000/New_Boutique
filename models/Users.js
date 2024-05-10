// Import Sequelize and define your model associations
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Import your Sequelize instance

// Define the Users model
const user = sequelize.define('Users', {
    // Define your model attributes
    mobilenumber:  DataTypes.STRING,
    otp:  DataTypes.STRING, // You can adjust the data type and length as needed,
   otpTimestamp:DataTypes.DATE,
});

// Export the Users model
module.exports = user;
