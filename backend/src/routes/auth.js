const express = require('express');
const router = express.Router();
const { login, register, getUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/user', auth, getUser);

module.exports = router; 