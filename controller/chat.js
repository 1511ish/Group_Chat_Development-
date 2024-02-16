const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');

exports.addChat = (req, res) => {
    const { message, token } = req.body;
    const obj = jwt.verify(token, 'secretKey');
    const userId = obj.userId;
    const promise = Chat.create({ message: message, userId: userId });
    promise.then(response => {
        console.log(response.message);
        return res.status(201).json({ message: response.message });
    }).catch(err => {
        console.log(err);
    })
}

exports.getChat = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const obj = jwt.verify(token, 'secretKey');
        const userId = obj.userId;
        const chats = await Chat.findAll({ where: { userId: userId } });
        return res.status(200).json({ chats: chats });
    } catch (err) {
        console.log(err);
    }
}