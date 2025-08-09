import nodemailer from 'nodemailer';

export async function sendEmail({ smtp, to, subject, text }) {
  const transporter = nodemailer.createTransport(smtp);
  await transporter.sendMail({ from: smtp.auth?.user, to: Array.isArray(to) ? to.join(',') : to, subject, text });
}


