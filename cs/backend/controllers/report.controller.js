import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify';
import Student from '../models/Student.model.js';
import Payment from '../models/Payment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/reports/students
export const exportStudents = asyncHandler(async (req, res) => {
  const { format = 'csv', course, batch, status } = req.query;

  const filter = {};
  if (course) filter.course = course;
  if (batch) filter.batch = batch;
  if (status) filter.status = status;

  const students = await Student.find(filter)
    .populate('course', 'name')
    .populate('batch', 'name')
    .sort('-createdAt')
    .lean({ virtuals: true });

  const rows = students.map((s) => ({
    Name: s.name,
    Phone: s.phone,
    Email: s.email || '',
    Course: s.course?.name || '',
    Batch: s.batch?.name || '',
    'Admission Date': s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-IN') : '',
    'Total Fees': s.totalFees,
    'Fees Paid': s.feesPaid,
    'Remaining Fees': s.remainingFees,
    'Fee Status': s.feeStatus,
    Status: s.status,
  }));

  const filename = `students_${Date.now()}`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    stringify(rows, { header: true }).pipe(res);
    return;
  }

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Students');
    if (rows.length > 0) {
      sheet.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k, width: 18 }));
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true };
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  if (format === 'pdf') {
    const doc = new PDFDocument({ margin: 40, layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    doc.pipe(res);
    doc.fontSize(16).text('Student Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(9);
    rows.forEach((row, i) => {
      doc.text(`${i + 1}. ${row.Name} | ${row.Phone} | ${row.Course} | ${row.Batch} | Paid: ₹${row['Fees Paid']} / ₹${row['Total Fees']} | ${row['Fee Status']}`);
    });
    doc.end();
    return;
  }

  res.status(400).json({ success: false, message: 'Invalid format. Use csv, excel, or pdf.' });
});

// GET /api/reports/payments
export const exportPayments = asyncHandler(async (req, res) => {
  const { format = 'csv' } = req.query;

  const payments = await Payment.find()
    .populate('student', 'name phone')
    .populate('recordedBy', 'name')
    .sort('-paymentDate')
    .lean();

  const rows = payments.map((p) => ({
    Student: p.student?.name || '',
    Phone: p.student?.phone || '',
    Amount: p.amount,
    'Payment Mode': p.paymentMode,
    'Payment Date': p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '',
    Notes: p.notes || '',
    'Recorded By': p.recordedBy?.name || '',
  }));

  const filename = `payments_${Date.now()}`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    stringify(rows, { header: true }).pipe(res);
    return;
  }

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payments');
    if (rows.length > 0) {
      sheet.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k, width: 20 }));
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true };
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  res.status(400).json({ success: false, message: 'Invalid format. Use csv or excel.' });
});
