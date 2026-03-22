const Task = require('../models/Task');

// GET /api/analytics/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);

    // 🔥 OPTIMIZED: Single aggregation for ALL metrics
    const result = await Task.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          today: [
            { $match: { 
              dueDate: { $gte: todayStart, $lte: todayEnd } 
            }},
            { $group: { 
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
            }}
          ],
          week: [
            { $match: { createdAt: { $gte: weekStart } }},
            { $group: { 
              _id: null,
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
            }}
          ],
          all: [
            { $group: { 
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              focusMinutes: { $sum: { $ifNull: ['$actualMinutes', 0] } },
              overdue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ['$status', 'completed'] },
                        { $ifNull: ['$dueDate', null] },
                        { $lt: ['$dueDate', todayStart] }
                      ]
                    },
                    1, 0
                  ]
                }
              }
            }}
          ]
        }
      }
    ]);

    const todayData = result[0]?.today[0] || { total: 0, completed: 0 };
    const weekData = result[0]?.week[0] || { completed: 0 };
    const allData = result[0]?.all[0] || { total: 0, completed: 0, focusMinutes: 0, overdue: 0 };

    res.json({
      success: true,
      data: {
        todayTotal: todayData.total,
        todayCompleted: todayData.completed,
        todayRate: todayData.total ? Math.round((todayData.completed / todayData.total) * 100) : 0,
        weekCompleted: weekData.completed,
        totalFocusMinutes: Math.round(allData.focusMinutes),
        completionRate: allData.total ? Math.round((allData.completed / allData.total) * 100) : 0,
        overdueTasks: allData.overdue,
        streak: req.user.streakData || { current: 0, best: 0 },
        totalTasks: allData.total
      }
    });
  } catch (err) { 
    console.error('Dashboard analytics error:', err);
    next(err); 
  }
};

// GET /api/analytics/weekly - SIMPLIFIED & FIXED
exports.getWeeklyChart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); 
      d.setDate(d.getDate() - i); 
      d.setHours(0,0,0,0);
      const end = new Date(d); 
      end.setHours(23,59,59,999);
      
      const dayTasks = await Task.find({
        user: userId, 
        dueDate: { $gte: d, $lte: end }
      }).lean();
      
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.status === 'completed').length,
        focusMinutes: dayTasks.reduce((s, t) => s + (t.actualMinutes || 0), 0)
      });
    }
    
    res.json({ success: true, data: days });
  } catch (err) {
    console.error('Weekly chart error:', err);
    next(err);
  }
};

// GET /api/analytics/trend - SIMPLIFIED & FIXED
exports.getTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = [];
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); 
      d.setDate(d.getDate() - i); 
      d.setHours(0,0,0,0);
      const end = new Date(d); 
      end.setHours(23,59,59,999);
      
      const completed = await Task.countDocuments({
        user: userId, 
        status: 'completed', 
        completedAt: { $gte: d, $lte: end }
      });
      
      days.push({ 
        date: d.toISOString().split('T')[0], 
        label: d.toLocaleDateString('en-US',{month:'short',day:'numeric'}), 
        completed 
      });
    }
    
    res.json({ success: true, data: days });
  } catch (err) {
    console.error('Trend analytics error:', err);
    next(err);
  }
};

// GET /api/analytics/categories
exports.getCategories = async (req, res, next) => {
  try {
    const result = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { $ifNull: ['$category', 'General'] },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ 
      success: true, 
      data: result.map(r => ({
        category: r._id,
        count: r.count,
        completed: r.completed,
        rate: r.count ? Math.round((r.completed / r.count) * 100) : 0
      }))
    });
  } catch (err) {
    console.error('Categories analytics error:', err);
    next(err);
  }
};

// GET /api/analytics/heatmap
exports.getHeatmap = async (req, res, next) => {
  try {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    
    const result = await Task.aggregate([
      { 
        $match: { 
          user: req.user._id, 
          status: 'completed',
          completedAt: { $exists: true, $ne: null, $gte: yearAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$completedAt' 
            } 
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const map = {};
    result.forEach(r => {
      map[r._id] = Math.min(r.count, 5); // Cap at 5 for heatmap
    });
    
    res.json({ success: true, data: map });
  } catch (err) {
    console.error('Heatmap analytics error:', err);
    next(err);
  }
};
