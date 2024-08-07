const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Group = sequelize.define('groups', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
        type:Sequelize.STRING(50),
        unique:true,
        notEmpty:true,
    },
    description:{
        type:Sequelize.STRING
    },
    membersNo:{
        type:Sequelize.INTEGER,
        allowNull:false       
    },
    dpUrl:{
        type:Sequelize.STRING
    },
    date:{
        type:Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },    
    },
    {
        timestamps: false
    });

module.exports = Group;