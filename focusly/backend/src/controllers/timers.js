const Task = require('../models/Task');

// POST /api/timers/:taskId/start
exports.startTimer = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.activeTimerStart) return res.status(400).json({ success: false, message: 'Timer already running' });

    task.activeTimerStart = new Date();
    if (task.status === 'pending') task.status = 'inprogress';
    await task.save();
    res.json({ success: true, task, startedAt: task.activeTimerStart });
  } catch (err) { next(err); }
};

// POST /api/timers/:taskId/stop
exports.stopTimer = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (!task.activeTimerStart) return res.status(400).json({ success: false, message: 'No active timer' });

    const endedAt = new Date();
    const duration = Math.round((endedAt - task.activeTimerStart) / 1000); // seconds

    task.timerLogs.push({ startedAt: task.activeTimerStart, endedAt, duration });
    task.actualMinutes = (task.actualMinutes || 0) + Math.round(duration / 60);
    task.activeTimerStart = null;
    await task.save();

    res.json({ success: true, task, duration, loggedMinutes: Math.round(duration / 60) });
  } catch (err) { next(err); }
};

// GET /api/timers/active
exports.getActiveTimers = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id, activeTimerStart: { $ne: null } })
      .select('_id title activeTimerStart status');
    res.json({ success: true, tasks });
  } catch (err) { next(err); }
};
