const express = require('express');
const router = express.Router();
const {
  getRecurringTransactions,
  getRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringTransactions,
} = require('../controllers/recurringController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getRecurringTransactions).post(protect, createRecurringTransaction);

router.post('/generate', protect, generateRecurringTransactions);

router
  .route('/:id')
  .get(protect, getRecurringTransaction)
  .put(protect, updateRecurringTransaction)
  .delete(protect, deleteRecurringTransaction);

module.exports = router;