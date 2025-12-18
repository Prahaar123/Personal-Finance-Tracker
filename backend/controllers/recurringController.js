const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

// @desc    Get all recurring transactions
// @route   GET /api/recurring
// @access  Private
const getRecurringTransactions = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find({
      user: req.user._id,
    })
      .populate('category', 'name icon color type')
      .sort('-createdAt');

    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single recurring transaction
// @route   GET /api/recurring/:id
// @access  Private
const getRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('category', 'name icon color type');

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create recurring transaction
// @route   POST /api/recurring
// @access  Private
const createRecurringTransaction = async (req, res) => {
  try {
    const { amount, type, category, frequency, dayOfMonth, notes, enabled } = req.body;

    const recurring = await RecurringTransaction.create({
      user: req.user._id,
      amount,
      type,
      category,
      frequency: frequency || 'monthly',
      dayOfMonth: dayOfMonth || 1,
      notes,
      enabled: enabled !== undefined ? enabled : true,
    });

    const populatedRecurring = await RecurringTransaction.findById(recurring._id).populate('category', 'name icon color type');

    res.status(201).json(populatedRecurring);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring/:id
// @access  Private
const updateRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    recurring.amount = req.body.amount || recurring.amount;
    recurring.type = req.body.type || recurring.type;
    recurring.category = req.body.category || recurring.category;
    recurring.dayOfMonth = req.body.dayOfMonth || recurring.dayOfMonth;
    recurring.notes = req.body.notes !== undefined ? req.body.notes : recurring.notes;
    recurring.enabled = req.body.enabled !== undefined ? req.body.enabled : recurring.enabled;

    const updatedRecurring = await recurring.save();
    await updatedRecurring.populate('category', 'name icon color type');

    res.json(updatedRecurring);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Private
const deleteRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    await recurring.deleteOne();

    res.json({ message: 'Recurring transaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate transactions from recurring
// @route   POST /api/recurring/generate
// @access  Private
const generateRecurringTransactions = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Find all enabled recurring transactions
    const recurringTransactions = await RecurringTransaction.find({
      user: req.user._id,
      enabled: true,
    });

    const generatedTransactions = [];

    for (const recurring of recurringTransactions) {
      // Check if we should generate for this recurring transaction
      const shouldGenerate =
        !recurring.lastGenerated ||
        new Date(recurring.lastGenerated).getMonth() !== currentMonth ||
        new Date(recurring.lastGenerated).getFullYear() !== currentYear;

      if (shouldGenerate && currentDay >= recurring.dayOfMonth) {
        // Create transaction
        const transaction = await Transaction.create({
          user: req.user._id,
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.category,
          date: new Date(currentYear, currentMonth, recurring.dayOfMonth),
          notes: `${recurring.notes || ''} (Auto-generated)`.trim(),
        });

        // Update lastGenerated
        recurring.lastGenerated = currentDate;
        await recurring.save();

        generatedTransactions.push(transaction);
      }
    }

    res.json({
      message: `Generated ${generatedTransactions.length} transactions`,
      transactions: generatedTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecurringTransactions,
  getRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringTransactions,
};