const express = require('express');

const router = express.Router();

const userController = require('../controller/user');
const userAuthentication = require('../middleware/auth');

router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.get('/getAll', userAuthentication.authenticate, userController.getAllUser);
router.get('/getAllUserExcept', userAuthentication.authenticate, userController.getAllUserExcept);
router.get('/get-user', userAuthentication.authenticate, userController.getcurrentuser);

module.exports = router;