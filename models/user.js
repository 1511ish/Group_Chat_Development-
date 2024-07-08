const Sequelize = require('sequelize');

const sequelize = require('../util/database');

module.exports = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    emailId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    mobile: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }

})