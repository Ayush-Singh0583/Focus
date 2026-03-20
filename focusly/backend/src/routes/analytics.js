const router = require('express').Router();
const { getDashboard, getWeeklyChart, getTrend, getCategories, getHeatmap } = require('../controllers/analytics');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/weekly', getWeeklyChart);
router.get('/trend', getTrend);
router.get('/categories', getCategories);
router.get('/heatmap', getHeatmap);

module.exports = router;
