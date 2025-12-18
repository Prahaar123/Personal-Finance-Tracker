const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // null for default categories
    },
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    icon: {
      type: String,
      default: '📁',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-specific categories
categorySchema.index({ user: 1, name: 1, type: 1 });

module.exports = mongoose.model('Category', categorySchema);