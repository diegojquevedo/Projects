const express = require('express');
const { signUp, signIn, recoveryPassword, resetPassword } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/recovery-password', recoveryPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
