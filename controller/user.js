const User = require('../models/User');
const bcrypt = require('bcrypt');

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
                res.status(400).json({ message: 'there is already account on this email or phone number!'});
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Something went wrong. Please try again later.' });
    }
}
