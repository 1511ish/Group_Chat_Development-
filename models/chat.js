const Sequelize = require('sequelize');
const sequelize = require('../util/database');

// const Chat = sequelize.define('chat', {
//     id: {
//         type: Sequelize.BIGINT,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     message: {
//         type: Sequelize.TEXT(),
//         allowNull: false
//     },
//     isImage: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false
//     },
//     isVideo: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false
//     },
//     dateTime: {
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
//     },
// },
//     {
//         timestamps: false
//     });

const Message = sequelize.define('messages', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    text: {
        type: Sequelize.TEXT,
        allowNull: true // Content can be null if the message contains a file
    },
    fileUrl: {
        type: Sequelize.STRING, // URL or path to the file
        allowNull: true // File URL can be null if the message doesn't contain a file
    },
    fileType: {
        type: Sequelize.ENUM('text', 'image', 'video', 'document'),
        allowNull: true // Type of content: text, image, video, audio, document, location, contact, link
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
},
    {
        timestamps: false
    });

module.exports = Message;