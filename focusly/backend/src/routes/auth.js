const router = require('express').Router();
const { register, login, logout, getMe, updateMe, changePassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.patch('/password', protect, changePassword);

module.exports = router;
