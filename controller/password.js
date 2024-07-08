const Sib = require('sib-api-v3-sdk')
require('dotenv').config();
const uuid = require('uuid')
const bcrypt = require('bcrypt')
const sequelize = require('../util/database')
const User = require('../models/user');
const ForgotPasswordRequest = require('../models/forgot_password');

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
    email: 'aakashsre6398@gmail.com'
}
// const receiver = [{
//     email: 'aakashsre6398@gmail.com'
// }]


exports.postResetPassword = async (req, res, next) => {
    try {
        const email = req.body.email
        const receiver = [{ email: email }]
        const user = await User.findOne({ where: { email_Id: email } })
        if (user) {
            const randomUUID = uuid.v4()
            await user.createForgotPasswordRequest({ id: randomUUID, isActive: true })
            await tranEmailApi.sendTransacEmail({
                sender,
                to: receiver,
                subject: 'Password reset',
                htmlContent: `<p>Hello ${user.name}<br>
                            You are receiving this mail as per your request to change your password for your expense tracker pro account.
                            You can change your password from here:<br>
                            <a href='${process.env.WEBSITE}/password/reset-password/${randomUUID}'>reset pasword</a></p>`
            })
            return res.status(202).json({ message: 'Link to reset password sent to your mail ', sucess: true })
        } else {
            throw new Error("Incorrect email Id!!");
        }


    } catch (err) {
        console.log(err)
        return res.status(403).json({ message: 'Error sending email!' })
    }
}



exports.getResetPassword = async (req, res, next) => {
    try {
        const forgetpassId = req.params.forgotPassId;
        const forgetReq = await ForgotPasswordRequest.findOne({ where: { id: forgetpassId } })

        if (forgetReq && forgetReq.isactive) {
            res.status(200).send(`<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                    }
            
                    .signup-container {
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        width: 350px;
                        text-align: center;
                    }
            
                    input {
                        width: 100%;
                        padding: 10px;
                        margin: 8px 0;
                        box-sizing: border-box;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    }
            
                    button {
                        background-color: #4caf50;
                        color: white;
                        padding: 10px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                    }
            
                    button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            
            <body>
                <div class="signup-container">
                    <h2>Log In</h2>
                    <form action="/password/update-password/${forgetpassId}" method="POST" id="form">
                        <label for="password">Enter New Password</label>
                        <input name="newpassword" type="password" required id="password"></input>
                        <button id="login_btn">reset password</button>
                    </form>
                </div>
            </body>
            
            </html>`)

        } else {
            return new Error('Invalid link to reset password!');
        }
    } catch (err) {
        console.log(err);
        return res.status(403).json({ message: 'Error in resetting the password!' });
    }
}



exports.updatePassword = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const forgotPassId = req.params.forgotPassId;
        const newPassword = req.body.newpassword;

        const forgotReq = await ForgotPasswordRequest.findOne({ where: { id: forgotPassId } })
        const user = await User.findOne({ where: { id: forgotReq.userId } })
        if (user) {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            const promise1 = user.update({ password: hashedPassword }, { transaction: t })
            //yaha p bhi mein row se karsakta tha..
            const promise2 = ForgotPasswordRequest.update({ isactive: false }, { where: { userId: user.id } }, { transaction: t })
            Promise.all([promise1, promise2])
                .then(async () => {
                    await t.commit()
                    return res.status(201).json({ message: 'Successfuly update the new password' })
                })
                .catch(async (err) => {
                    console.log(err)
                    await t.rollback()
                    throw new Error('Could not change the user password!')
                })
        } else {
            await t.rollback();
            throw new Error("User doesn't exist!")
        }
    } catch (err) {
        console.log(err)
        res.status(403).json({ message: err })
    }

}