import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendFeeReminder = async (student, dueDate, customMessage = '') => {
  if (!student.email) {
    throw new Error(`Student "${student.name}" has no email address`);
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured. Add SMTP_USER and SMTP_PASS to .env');
  }

  const remaining = student.totalFees - student.feesPaid;
  const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'As soon as possible';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Fee Payment Reminder</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Dear <strong>${student.name}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
          This is a reminder that your fee payment is pending. Please find the details below:
        </p>
        <div style="background: white; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Course</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1e293b;">${student.course?.name || 'N/A'}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;">Total Fees</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1e293b;">₹${student.totalFees.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;">Amount Paid</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #16a34a;">₹${student.feesPaid.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Remaining Balance</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #dc2626; font-size: 16px;">₹${remaining.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-top: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #64748b;">Due Date</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #d97706;">${dueDateFormatted}</td>
            </tr>
          </table>
        </div>
        ${customMessage ? `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 20px 0;"><p style="margin: 0; font-size: 14px; color: #92400e;">${customMessage}</p></div>` : ''}
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Please clear your pending fees at the earliest. If you have already made the payment, kindly ignore this email.
        </p>
        <p style="font-size: 14px; color: #475569; margin-bottom: 0;">
          Regards,<br><strong>Institute Administration</strong>
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">This is an automated email from Coaching Institute Data Management System.</p>
      </div>
    </div>
  `;

  const info = await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: student.email,
    subject: `Fee Payment Reminder — ₹${remaining.toLocaleString('en-IN')} Pending`,
    html,
  });

  return info;
};
