const router = require('express').Router();
const { startTimer, stopTimer, getActiveTimers } = require('../controllers/timers');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/active', getActiveTimers);
router.post('/:taskId/start', startTimer);
router.post('/:taskId/stop', stopTimer);

module.exports = router;
