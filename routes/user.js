const express = require('express');

const router = express.Router();

const userController = require('../controller/user');
const userAuthentication = require('../middleware/auth');

router.post('/signup', userController.signUp);
router.get('/loginPage', userController.getLoginPage);
router.post('/login', userController.login);
router.get('/main', userController.getMainPage);
router.get('/getAll', userAuthentication.authenticate, userController.getAllUser);
router.get('/getAllUserExcept', userAuthentication.authenticate, userController.getAllUserExcept);
router.post('/create-group', userAuthentication.authenticate, userController.createGroup);
router.post('/update-group', userAuthentication.authenticate, userController.updateGroup);
router.delete('/delete-group', userController.deleteGroup);
router.post('/update-group/add-user', userAuthentication.authenticate, userController.addUser)
router.post('/update-group/remove-user', userAuthentication.authenticate, userController.removeUser)
router.get('/get-mygroups', userAuthentication.authenticate, userController.getMygroups);
router.get('/get-user', userAuthentication.authenticate, userController.getcurrentuser);
router.get('/get-group', userController.getGroupbyId);
router.get('/get-group-messages', userController.getGroupChatHistory);
router.get('/get-group-members', userAuthentication.authenticate, userController.getGroupMembersbyId)

module.exports = router;