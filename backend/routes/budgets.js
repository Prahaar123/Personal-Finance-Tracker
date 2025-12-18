const express = require('express');
const router = express.Router();
const { getBudgets, getBudget, createBudget, updateBudget, deleteBudget, getBudgetHistory } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getBudgets).post(protect, createBudget);

router.route('/:id').get(protect, getBudget).put(protect, updateBudget).delete(protect, deleteBudget);

router.get('/history/:categoryId', protect, getBudgetHistory);

module.exports = router;