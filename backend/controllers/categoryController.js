const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;

    const categories = await Category.find(query).sort('name');

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    // Check if category with same name and type exists
    const existingCategory = await Category.findOne({
      user: req.user._id,
      name,
      type,
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      icon: icon || '📁',
      color: color || '#6366f1',
      isDefault: false,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Don't allow updating default categories
    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot update default categories' });
    }

    category.name = req.body.name || category.name;
    category.icon = req.body.icon || category.icon;
    category.color = req.body.color || category.color;

    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Don't allow deleting default categories
    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default categories' });
    }

    // Check if category is used in transactions
    const transactionCount = await Transaction.countDocuments({
      user: req.user._id,
      category: category._id,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with existing transactions',
      });
    }

    // Delete associated budgets
    await Budget.deleteMany({ user: req.user._id, category: category._id });

    await category.deleteOne();

    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category spending summary
// @route   GET /api/categories/:id/summary
// @access  Private
const getCategorySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const summary = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          category: req.params.id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategorySummary,
};