const Transaction = require('../models/Transaction');

// @desc    Get income vs expense analytics
// @route   GET /api/analytics/income-expense
// @access  Private
const getIncomeExpenseAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', year } = req.query;
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    let groupBy, startDate, endDate;

    if (period === 'monthly') {
      groupBy = { month: { $month: '$date' }, year: { $year: '$date' } };
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59);
    } else if (period === 'yearly') {
      groupBy = { year: { $year: '$date' } };
      startDate = new Date(targetYear - 5, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59);
    }

    const analytics = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { ...groupBy, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category breakdown analytics
// @route   GET /api/analytics/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res) => {
  try {
    const { month, year, type = 'expense' } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          _id: 1,
          total: 1,
          count: 1,
          name: '$category.name',
          icon: '$category.icon',
          color: '$category.color',
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily spending trends
// @route   GET /api/analytics/daily-trends
// @access  Private
const getDailyTrends = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.day': 1 },
      },
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIncomeExpenseAnalytics,
  getCategoryBreakdown,
  getDailyTrends,
};