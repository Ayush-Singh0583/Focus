const Task = require('../models/Task');

// GET /api/analytics/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);

    const [todayTasks, weekTasks, allTasks] = await Promise.all([
      Task.find({ user: userId, dueDate: { $gte: todayStart, $lte: todayEnd } }).lean(),
      Task.find({ user: userId, createdAt: { $gte: weekStart } }).lean(),
      Task.find({ user: userId }).lean()
    ]);

    const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;
    const todayTotal = todayTasks.length;
    const weekCompleted = weekTasks.filter(t => t.status === 'completed').length;
    const totalFocusMinutes = allTasks.reduce((s, t) => s + (t.actualMinutes || 0), 0);
    const completionRate = allTasks.length ? Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100) : 0;
    const overdueTasks = allTasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < todayStart).length;

    res.json({
      success: true,
      data: {
        todayTotal,
        todayCompleted,
        todayRate: todayTotal ? Math.round((todayCompleted / todayTotal) * 100) : 0,
        weekCompleted,
        totalFocusMinutes,
        completionRate,
        overdueTasks,
        streak: req.user.streakData,
        totalTasks: allTasks.length
      }
    });
  } catch (err) { next(err); }
};

// GET /api/analytics/weekly
exports.getWeeklyChart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const dayTasks = await Task.find({ user: userId, dueDate: { $gte: d, $lte: end } }).lean();
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.status === 'completed').length,
        focusMinutes: dayTasks.reduce((s, t) => s + (t.actualMinutes || 0), 0)
      });
    }
    res.json({ success: true, data: days });
  } catch (err) { next(err); }
};

// GET /api/analytics/trend
exports.getTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const completed = await Task.countDocuments({ user: userId, status: 'completed', completedAt: { $gte: d, $lte: end } });
      days.push({ date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), completed });
    }
    res.json({ success: true, data: days });
  } catch (err) { next(err); }
};

// GET /api/analytics/categories
exports.getCategories = async (req, res, next) => {
  try {
    const result = await Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status','completed'] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: result.map(r => ({ category: r._id || 'General', count: r.count, completed: r.completed })) });
  } catch (err) { next(err); }
};

// GET /api/analytics/heatmap
exports.getHeatmap = async (req, res, next) => {
  try {
    const yearAgo = new Date(); yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const result = await Task.aggregate([
      { $match: { user: req.user._id, completedAt: { $gte: yearAgo }, status: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } }
    ]);
    const map = {};
    result.forEach(r => { map[r._id] = r.count; });
    res.json({ success: true, data: map });
  } catch (err) { next(err); }
};
