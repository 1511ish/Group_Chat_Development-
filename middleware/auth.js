const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

exports.authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const obj = jwt.verify(token, process.env.SECRET_KEY);
        User.findByPk(obj.userId).then(user => {
            req.user = user;
            req.userId = user.id;
            next();
        }).catch(err => { throw new Error(err) });
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }
}