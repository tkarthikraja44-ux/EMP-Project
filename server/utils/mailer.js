import nodemailer from 'nodemailer';

export const sendCompletionEmail = async ({ to, name, title, score, percentage }) => {
  if (!process.env.SMTP_HOST) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Test Completed: ${title}`,
    html: `<p>Hi ${name},</p><p>You completed <strong>${title}</strong>.</p><p>Score: ${score} (${percentage}%)</p>`
  });
};
