const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.signUp = async (req, res) => {
    try {
        const { name, email, phone_no, password } = req.body;
        const salt = await bcrypt.genSalt();
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            console.log(hash);
            try {
                await User.create({ name: name, email_Id: email, phone_No: phone_no, password: hash });
                res.status(201).json({ message: 'Successfully created new user' });
                console.log('SUCCESSFULLY ADDED');
            } catch (error) {
                res.status(400).json({ message: 'there is already account on this email or phone number!' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Something went wrong. Please try again later.' });
    }
}

// -------------------------ANOTHER WAY-----------------------
// exports.userSignup = async (req, res) => {
//     try {
//         const { name, email, phone_no, password } = req.body;
//         let userExist = await User.findOne({
//             where: {
//                 [Op.or]: [{ email }, { phonenumber }]
//             }
//         });
//         if (!userExist) {
//             const hash = await bcrypt.hash(password, 10);
//             const user = await User.create({ name, email, phone_no, password: hash });
//             const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
//             response.cookie('token', token, { maxAge: 3600000 });
//             return response.status(201).json({ message: "user Account created successfully" });
//         } else {
//             return response.status(409).json({ message: 'Email or Phone Number already exist!' })
//         }


//     } catch (error) {
//         console.log(error);
//     }
// }

exports.getLoginPage = async (req, res) => {
    res.sendFile('login.html', { root: 'views' });
}

exports.login = async (request, response) => {
    try {
        const { email, password } = request.body;
        let userExist = await User.findOne({ where: { email_Id: email } })
        if (userExist) {
            const isPasswordValid = await bcrypt.compare(password, userExist.password);
            console.log(isPasswordValid);
            if (isPasswordValid) {
                const token = jwt.sign({ userId: userExist.id }, process.env.SECRET_KEY);
                return response.status(201).json({ success: true, message: "User logged in successfully", token: token });
            } else {
                return response.status(401).json({ success: false, message: 'Invalid Password!' });
            }
        } else {
            return response.status(404).json({ message: 'Account is not exist!' })
        }


    } catch (error) {
        console.log(error);
    }
}

exports.getMainPage = async (req, res) => {
    res.sendFile('main.html', { root: 'views' });
}