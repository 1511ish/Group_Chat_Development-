const express = require('express');

const router = express.Router();

const chatController = require('../controller/chat');

router.post('/add', chatController.addChat);
router.get('/get', chatController.getChat);

module.exports = router;


