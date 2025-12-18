const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const User = require('../models/User');

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Get income and expenses
    const summary = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const income = summary.find((s) => s._id === 'income')?.total || 0;
    const expenses = summary.find((s) => s._id === 'expense')?.total || 0;
    const balance = income - expenses;

    // Get user's financial goals
    const user = await User.findById(req.user._id);
    const savingsGoal = user.financialGoals?.monthlySavings || 0;
    const savingsPercentage = savingsGoal > 0 ? (balance / savingsGoal) * 100 : 0;

    // Get budget utilization
    const budgets = await Budget.find({
      user: req.user._id,
      month: targetMonth,
      year: targetYear,
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      user: req.user._id,
    })
      .populate('category', 'name icon color type')
      .sort('-date')
      .limit(5);

    res.json({
      income,
      expenses,
      balance,
      savingsGoal,
      savingsPercentage: Math.round(savingsPercentage),
      budgetUtilization: Math.round(budgetUtilization),
      recentTransactions,
      month: targetMonth,
      year: targetYear,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
};