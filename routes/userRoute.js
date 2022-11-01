const express = require('express');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgetPassword);
router.post('/resetpassword/:token', authController.resetPassword);

module.exports = router;
