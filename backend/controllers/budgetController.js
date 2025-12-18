const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month: targetMonth,
      year: targetYear,
    }).populate('category', 'name icon color type');

    // Calculate alerts
    const budgetsWithAlerts = budgets.map((budget) => {
      const percentage = (budget.spent / budget.amount) * 100;
      let alert = null;

      if (percentage >= 100) {
        alert = { level: 'danger', message: 'Budget exceeded!' };
      } else if (percentage >= 80) {
        alert = { level: 'warning', message: 'Approaching budget limit' };
      }

      return {
        ...budget.toObject(),
        percentage: Math.round(percentage),
        alert,
      };
    });

    res.json(budgetsWithAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('category', 'name icon color type');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    // Calculate current spent for this category
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const totalSpent = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          category: category,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        category,
        month: targetMonth,
        year: targetYear,
      },
      {
        amount,
        spent,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate('category', 'name icon color type');

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.amount = req.body.amount || budget.amount;

    const updatedBudget = await budget.save();
    await updatedBudget.populate('category', 'name icon color type');

    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await budget.deleteOne();

    res.json({ message: 'Budget removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get budget history
// @route   GET /api/budgets/history/:categoryId
// @access  Private
const getBudgetHistory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { months = 6 } = req.query;

    const budgets = await Budget.find({
      user: req.user._id,
      category: categoryId,
    })
      .sort({ year: -1, month: -1 })
      .limit(parseInt(months))
      .populate('category', 'name icon color type');

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetHistory,
};