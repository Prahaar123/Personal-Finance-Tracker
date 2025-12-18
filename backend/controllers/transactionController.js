const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate, sort = '-date' } = req.query;

    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name icon color type')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('category', 'name icon color type');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
    });

    // Update budget spent if expense
    if (type === 'expense') {
      const transactionDate = new Date(date || Date.now());
      const month = transactionDate.getMonth() + 1;
      const year = transactionDate.getFullYear();

      await updateBudgetSpent(req.user._id, category, month, year);
    }

    const populatedTransaction = await Transaction.findById(transaction._id).populate('category', 'name icon color type');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const oldCategory = transaction.category;
    const oldDate = transaction.date;
    const oldType = transaction.type;

    transaction.amount = req.body.amount || transaction.amount;
    transaction.type = req.body.type || transaction.type;
    transaction.category = req.body.category || transaction.category;
    transaction.date = req.body.date || transaction.date;
    transaction.notes = req.body.notes !== undefined ? req.body.notes : transaction.notes;

    const updatedTransaction = await transaction.save();

    // Update budgets if expense
    if (oldType === 'expense' || transaction.type === 'expense') {
      const oldMonth = new Date(oldDate).getMonth() + 1;
      const oldYear = new Date(oldDate).getFullYear();
      const newMonth = new Date(transaction.date).getMonth() + 1;
      const newYear = new Date(transaction.date).getFullYear();

      // Recalculate old budget
      if (oldType === 'expense') {
        await updateBudgetSpent(req.user._id, oldCategory, oldMonth, oldYear);
      }

      // Recalculate new budget
      if (transaction.type === 'expense') {
        await updateBudgetSpent(req.user._id, transaction.category, newMonth, newYear);
      }
    }

    const populatedTransaction = await Transaction.findById(updatedTransaction._id).populate('category', 'name icon color type');

    res.json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { category, date, type } = transaction;

    await transaction.deleteOne();

    // Update budget if expense
    if (type === 'expense') {
      const month = new Date(date).getMonth() + 1;
      const year = new Date(date).getFullYear();
      await updateBudgetSpent(req.user._id, category, month, year);
    }

    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update budget spent
const updateBudgetSpent = async (userId, categoryId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const totalSpent = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        category: categoryId,
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

  await Budget.findOneAndUpdate(
    { user: userId, category: categoryId, month, year },
    { spent },
    { upsert: false }
  );
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};