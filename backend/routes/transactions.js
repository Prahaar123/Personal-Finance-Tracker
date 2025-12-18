const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getTransactions).post(protect, createTransaction);

router.route('/:id').get(protect, getTransaction).put(protect, updateTransaction).delete(protect, deleteTransaction);

module.exports = router;