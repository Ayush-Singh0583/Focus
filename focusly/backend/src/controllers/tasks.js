const Task = require('../models/Task');

// GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, due, search, sort = '-createdAt' } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (due === 'today') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      filter.dueDate = { $gte: start, $lte: end };
    } else if (due === 'overdue') {
      const now = new Date(); now.setHours(0,0,0,0);
      filter.dueDate = { $lt: now };
      filter.status = { $ne: 'completed' };
    } else if (due === 'upcoming') {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setHours(0,0,0,0);
      filter.dueDate = { $gte: tomorrow };
    }
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter).sort(sort).lean();
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) { next(err); }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, category, tags, dueDate,
            estimatedMinutes, progress, subtasks, isRecurring, recurringPattern, links } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    const task = await Task.create({
      user: req.user._id, title: title.trim(), description, status, priority, category,
      tags, dueDate, estimatedMinutes, progress, subtasks, isRecurring, recurringPattern, links
    });
    res.status(201).json({ success: true, task });
  } catch (err) { next(err); }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const allowed = ['title','description','status','priority','category','tags','dueDate',
                     'estimatedMinutes','progress','subtasks','isRecurring','recurringPattern','links','order'];
    allowed.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

    await task.save();

    // Update user streak
    if (req.body.status === 'completed') await updateStreak(req.user._id);

    res.json({ success: true, task });
  } catch (err) { next(err); }
};

// PATCH /api/tasks/:id/subtask/:subtaskId
exports.toggleSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const sub = task.subtasks.id(req.params.subtaskId);
    if (!sub) return res.status(404).json({ success: false, message: 'Subtask not found' });
    sub.done = !sub.done;
    // Auto-update progress based on subtasks
    const total = task.subtasks.length;
    const done = task.subtasks.filter(s => s.done).length;
    if (total > 0) task.progress = Math.round((done / total) * 100);
    await task.save();
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};

// DELETE /api/tasks (bulk)
exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ success: false, message: 'No IDs provided' });
    await Task.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ success: true, message: `${ids.length} tasks deleted` });
  } catch (err) { next(err); }
};

// Helper: update streak
async function updateStreak(userId) {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    const today = new Date().toISOString().split('T')[0];
    if (user.streakData.lastActiveDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.streakData.lastActiveDate === yesterday) {
      user.streakData.current += 1;
    } else {
      user.streakData.current = 1;
    }
    user.streakData.longest = Math.max(user.streakData.longest, user.streakData.current);
    user.streakData.lastActiveDate = today;
    await user.save();
  } catch (e) { console.error('Streak update error:', e); }
}
