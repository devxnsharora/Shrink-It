const express = require('express');

const { registerUser, loginUser } = require('../controllers/user.controller');
const router = express.Router();

//@route POST /api/users/register
//@desc Register a new user
router.post('/register', registerUser);

//@route POST /api/user/login
//@desc Authenticate user and get token
router.post('/login', loginUser);

module.exports = router;
