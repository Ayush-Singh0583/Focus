const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false }
}, { _id: true });

const timerLogSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 } // seconds
}, { _id: true });

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 500 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['pending', 'inprogress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, trim: true, default: 'General', maxlength: 100 },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  dueDate: { type: Date },
  completedAt: { type: Date },
  estimatedMinutes: { type: Number, default: 0, min: 0 },
  actualMinutes: { type: Number, default: 0, min: 0 },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  subtasks: [subtaskSchema],
  timerLogs: [timerLogSchema],
  activeTimerStart: { type: Date, default: null },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: { type: String, enum: ['daily', 'weekly', 'none'], default: 'none' },
  links: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// Auto-update completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
      this.progress = 100;
    } else if (this.status !== 'completed') {
      this.completedAt = undefined;
    }
  }
  next();
});

// Virtual: total timer seconds
taskSchema.virtual('totalTimerSeconds').get(function() {
  return this.timerLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
});

module.exports = mongoose.model('Task', taskSchema);
