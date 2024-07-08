const jwt = require('jsonwebtoken');
const Chat = require('../models/chat');

const dotenv = require('dotenv');
dotenv.config();


exports.addChat = (req, res) => {
    const { message, token, groupId, fileUrl, fileType } = req.body;
    const obj = jwt.verify(token, process.env.SECRET_KEY);
    const userId = obj.userId;
    const name = obj.name;
    const promise = Chat.create({ text: message, userId: userId, groupId: groupId, fileType: fileType, fileUrl: fileUrl });
    promise.then(response => {
        return res.status(201).json({ name: name, text: response.text, fileUrl: response.fileUrl, createdAt: response.createdAt });
    }).catch(err => {
        console.log(err);
    })
}

exports.getChat = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const obj = jwt.verify(token, process.env.SECRET_KEY);
        const userId = obj.userId;
        const chats = await Chat.findAll({ where: { userId: userId } });
        return res.status(200).json({ chats: chats });
    } catch (err) {
        console.log(err);
    }
}