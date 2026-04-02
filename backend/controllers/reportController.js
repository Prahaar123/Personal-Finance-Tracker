const fs = require('fs');
const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const FONT_REGULAR = 'C:/Windows/Fonts/arial.ttf';
const FONT_BOLD = 'C:/Windows/Fonts/arialbd.ttf';

const formatCurrency = (value, currencyCode = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const applyPdfFonts = (doc) => {
  if (fs.existsSync(FONT_REGULAR) && fs.existsSync(FONT_BOLD)) {
    doc.registerFont('report-regular', FONT_REGULAR);
    doc.registerFont('report-bold', FONT_BOLD);
    doc.font('report-regular');
    return {
      regular: 'report-regular',
      bold: 'report-bold',
    };
  }

  return {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold',
  };
};

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

    const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    const doc = new PDFDocument({ margin: 50 });
    const fonts = applyPdfFonts(doc);

    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename=transactions.pdf');

    doc.pipe(res);

    doc.font(fonts.bold).fontSize(20).text('Financial Report', { align: 'center' });
    doc.moveDown();

    if (startDate || endDate) {
      doc.font(fonts.regular).fontSize(12).text(`Period: ${startDate || 'Beginning'} to ${endDate || 'Present'}`, { align: 'center' });
      doc.moveDown();
    }

    doc.font(fonts.bold).fontSize(14).text('Summary', { underline: true });
    doc.font(fonts.regular).fontSize(12);
    doc.text(`Total Income: ${formatCurrency(income, req.user.currency)}`);
    doc.text(`Total Expenses: ${formatCurrency(expenses, req.user.currency)}`);
    doc.text(`Balance: ${formatCurrency(balance, req.user.currency)}`);
    doc.moveDown();

    doc.font(fonts.bold).fontSize(14).text('Transactions', { underline: true });
    doc.moveDown(0.5);

    transactions.forEach((t) => {
      doc.font(fonts.regular).fontSize(10);
      doc.text(`${new Date(t.date).toLocaleDateString()} - ${t.category.name} - ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, req.user.currency)}`);
      if (t.notes) {
        doc.font(fonts.regular).fontSize(8).fillColor('gray').text(`  ${t.notes}`).fillColor('black');
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
