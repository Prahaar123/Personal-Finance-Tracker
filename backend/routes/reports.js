const express = require('express');
const router = express.Router();
const { exportCSV, exportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/csv', protect, exportCSV);
router.get('/pdf', protect, exportPDF);

module.exports = router;