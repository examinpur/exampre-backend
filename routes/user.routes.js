const express = require('express');
const userRoutes = express.Router();
const { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword } = require('../controller/user.controller');
const { validateRegister, validateLogin } = require('../middleware/validation');

userRoutes.post('/register', validateRegister, registerUser);
userRoutes.post('/login', validateLogin, loginUser);
userRoutes.get('/verify/:token', verifyEmail);
userRoutes.post('/forgot-password', forgotPassword);
userRoutes.post('/reset-password/:token', resetPassword);

module.exports = userRoutes;