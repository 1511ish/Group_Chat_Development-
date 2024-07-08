const express = require('express');

const router = express.Router();

const passwordController = require('../controller/password');

router.post('/forgot-password', passwordController.postResetPassword);
router.get('/reset-password/:forgotPassId', passwordController.getResetPassword);
router.post('/update-password/:forgotPassId', passwordController.updatePassword)

module.exports = router;