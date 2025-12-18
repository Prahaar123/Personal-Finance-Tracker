const express = require('express');
const router = express.Router();
const { getIncomeExpenseAnalytics, getCategoryBreakdown, getDailyTrends } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/income-expense', protect, getIncomeExpenseAnalytics);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/daily-trends', protect, getDailyTrends);

module.exports = router;