const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');

// this is working fine..
exports.addChat = (req, res) => {
    const { message, token, groupId } = req.body;
    console.log(groupId);
    const obj = jwt.verify(token, 'secretKey');
    console.log(obj);
    const userId = obj.userId;
    const name = obj.name;
    const promise = Chat.create({ message: message, userId: userId, GroupId: groupId });
    promise.then(response => {
        console.log(response);
        return res.status(201).json({ message: response.message, name: name, date_time: response.date_time });
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