const express = require('express');

const router = express.Router();

const userController = require('../controller/user');

router.post('/signup', userController.signUp);
router.get('/loginPage', userController.getLoginPage);
router.post('/login', userController.login);
router.get('/main', userController.getMainPage);

module.exports = router;