const User = require('../models/User');
const Group = require('../models/groups');
const Chat = require('../models/Chat');
// const DB = require('../util/database');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
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
                const token = jwt.sign({ userId: userExist.id, name: userExist.name }, process.env.SECRET_KEY);
                // DB.online_arr.push(userExist.name);
                // console.log(DB.online_arr);
                return response.status(201).json({ success: true, message: `${userExist.name} logged in successfully`, token: token });
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

exports.getAllUser = async (req, res) => {
    const user = req.user;
    const users = await User.findAll({
        attributes: ['id', 'name'],
        where: {
            id: {
                [Op.ne]: user.id // Op.ne is Sequelize's "not equal" operator
            }
        }
    });
    return res.status(200).json({ success: true, users: users });
}

exports.getAllUserExcept = async (req, res) => {
    const user = req.user;
    let userIds = JSON.parse(req.header('userIds'));
    userIds.push(user.id);
    const users = await User.findAll({
        attributes: ['id', 'name'],
        where: {
            id: {
                [Op.notIn]: userIds
            }
        }
    });
    return res.status(200).json({ success: true, users: users });
}

exports.createGroup = async (request, response, next) => {
    try {
        const user = request.user;
        const { name, description, membersNo, membersIds, dp_url } = request.body;
        const group = await user.createGroup({
            name,
            membersNo,
            dp_url,
            description,
            AdminId: user.id
        })
        membersIds.push(user.id);
        await group.addUsers(membersIds.map((ele) => {
            return Number(ele)
        }));
        console.log(group.id);
        return response.status(200).json({ group, message: "Group is succesfylly created" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.updateGroup = async (request, response, next) => {
    try {
        const { name, description, dp_url, groupId } = request.body;
        const group = await Group.findOne({ where: { id: groupId } })
        await group.update({
            name: name,
            dp_url: dp_url,
            description: description,
        })
        return response.status(200).json({ group, message: "Group is succesfylly created" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.query;
        await Group.destroy({
            where: {
                id: groupId
            }
        })
        return res.status(200).json({ message: "Group is succesfylly deleted." })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.addUser = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const { usersToAddIds } = request.body;
        const group = await Group.findOne({ where: { id: Number(groupId) } });
        const currentNumberOfUsers = await group.countUsers();
        const updatedGroup = await group.addUsers(usersToAddIds);
        const updatedNumberOfUsers = currentNumberOfUsers + usersToAddIds.length;
        await group.update({ membersNo: updatedNumberOfUsers });
        console.log('User added to the group successfully.');
        return response.status(200).json({ updatedGroup, message: "User added to the group successfully." })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.removeUser = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const { usersToRemoveIds } = request.body;
        const group = await Group.findOne({ where: { id: Number(groupId) } });
        const currentNumberOfUsers = await group.countUsers();
        const updatedGroup = await group.removeUsers(usersToRemoveIds);
        console.log('currentNumberOfUsers: ', currentNumberOfUsers);
        console.log('usersToRemoveIds.length: ', usersToRemoveIds.length);
        const updatedNumberOfUsers = currentNumberOfUsers - usersToRemoveIds.length;
        console.log('updatedNumberOfUsers: ', updatedNumberOfUsers);
        await group.update({ membersNo: updatedNumberOfUsers });
        return response.status(200).json({ updatedGroup, message: "Group is succesfylly updated" })
    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getGroupbyId = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const group = await Group.findOne({ where: { id: Number(groupId) } });
        response.status(200).json({ group, message: "Group details succesfully fetched" })
    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getMygroups = async (request, response, next) => {
    try {
        const user = request.user;
        const groups = await user.getGroups();
        return response.status(200).json({ groups, message: "All groups succesfully fetched" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getGroupMembersbyId = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const user = request.user;
        const group = await Group.findOne({ where: { id: Number(groupId) } });
        const AllusersData = await group.getUsers({
            attributes: ['id', 'name'],
            where: {
                id: {
                    [Op.ne]: user.id // Op.ne is Sequelize's "not equal" operator
                }
            }
        });
        const users = AllusersData.map((ele) => {
            return {
                id: ele.id,
                name: ele.name,
            }
        })
        const userIds = AllusersData.map((ele) => {
            return ele.id;
        })

        response.status(200).json({ users, userIds, message: "Group members name succesfully fetched" })
    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

exports.getcurrentuser = async (request, response, next) => {
    const user = request.user;
    response.json({ userId: user.id, user });
}

exports.getGroupChatHistory = async (request, response, next) => {
    try {
        const { groupId } = request.query;
        const chatHistories = await Chat.findAll({
            include: [
                {
                    model: User,
                    attibutes: ['id', 'name', 'date_time']
                }
            ],
            order: [['date_time', 'ASC']],
            where: {
                GroupId: Number(groupId),
            }
        });
        // console.log(chatHistories);
        // const chats = chatHistories.map(async (ele) => {
        //     const user = await ele.getUser();
        //     console.log(user);
        //     return {
        //         messageId: ele.id,
        //         message: ele.message,
        //         // isImage: ele.isImage,
        //         name: user.name,
        //         userId: user.id,
        //         // date_time: ele.date_time
        //     };
        // })
        const chats = await Promise.all(chatHistories.map(async (ele) => {
            try {
                const user = await ele.getUser();
                // console.log(user);
                return {
                    messageId: ele.id,
                    message: ele.message,
                    isImage: ele.isImage,
                    name: user.name,
                    userId: user.id,
                    date_time: ele.date_time
                };
            } catch (error) {
                console.error('Error fetching user:', error);
                return null; // or handle the error in a way that suits your application
            }
        }));

        console.log(chats);
        return response.status(200).json({ chats, message: "User chat History Fetched" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}

