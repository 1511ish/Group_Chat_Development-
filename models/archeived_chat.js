const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('archived_chats', {
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
    createdDate: {
        type: Sequelize.DATE
    },
    userId: {
        type: Sequelize.BIGINT,
    },
    groupId: {
        type: Sequelize.BIGINT,
    }
},
    {
        timestamps: false
    }
);

module.exports = ArchivedChat;