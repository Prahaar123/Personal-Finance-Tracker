const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category'],
    },
    frequency: {
      type: String,
      required: true,
      enum: ['monthly'],
      default: 'monthly',
    },
    dayOfMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
      default: 1,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    lastGenerated: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
recurringTransactionSchema.index({ user: 1, enabled: 1 });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);