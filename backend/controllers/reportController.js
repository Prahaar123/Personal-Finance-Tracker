const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// @desc    Export transactions as CSV
// @route   GET /api/reports/csv
// @access  Private
const exportCSV = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name type')
      .sort('-date');

    const data = transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Type: t.type,
      Category: t.category.name,
      Amount: t.amount,
      Notes: t.notes || '',
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export transactions as PDF
// @route   GET /api/reports/pdf
// @access  Private
const exportPDF = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name type')
      .sort('-date');

    // Calculate summary
    const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename=transactions.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.moveDown();

    // Date range
    if (startDate || endDate) {
      doc.fontSize(12).text(`Period: ${startDate || 'Beginning'} to ${endDate || 'Present'}`, { align: 'center' });
      doc.moveDown();
    }

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Income: $${income.toFixed(2)}`);
    doc.text(`Total Expenses: $${expenses.toFixed(2)}`);
    doc.text(`Balance: $${balance.toFixed(2)}`);
    doc.moveDown();

    // Transactions
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.moveDown(0.5);

    transactions.forEach((t) => {
      doc.fontSize(10);
      doc.text(`${new Date(t.date).toLocaleDateString()} - ${t.category.name} - ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}`, {
        continued: false,
      });
      if (t.notes) {
        doc.fontSize(8).fillColor('gray').text(`  ${t.notes}`).fillColor('black');
      }
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportCSV,
  exportPDF,
};