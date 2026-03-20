const router = require('express').Router();
const { getTasks, getTask, createTask, updateTask, deleteTask, bulkDelete, toggleSubtask } = require('../controllers/tasks');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getTasks).post(createTask);
router.route('/bulk-delete').delete(bulkDelete);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.patch('/:id/subtask/:subtaskId', toggleSubtask);

module.exports = router;
