const User = require('../models/User');
const Category = require('../models/Category');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, currency } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      currency: currency || 'USD',
    });

    // Create default categories for the user
    const defaultCategories = [
      { name: 'Salary', type: 'income', icon: '💰', color: '#10b981', isDefault: true },
      { name: 'Freelance', type: 'income', icon: '💼', color: '#3b82f6', isDefault: true },
      { name: 'Investment', type: 'income', icon: '📈', color: '#8b5cf6', isDefault: true },
      { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true },
      { name: 'Transportation', type: 'expense', icon: '🚗', color: '#f59e0b', isDefault: true },
      { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', isDefault: true },
      { name: 'Entertainment', type: 'expense', icon: '🎮', color: '#6366f1', isDefault: true },
      { name: 'Bills & Utilities', type: 'expense', icon: '📄', color: '#14b8a6', isDefault: true },
      { name: 'Healthcare', type: 'expense', icon: '🏥', color: '#f43f5e', isDefault: true },
      { name: 'Education', type: 'expense', icon: '📚', color: '#0ea5e9', isDefault: true },
    ];

    await Category.insertMany(
      defaultCategories.map((cat) => ({
        ...cat,
        user: user._id,
      }))
    );

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};