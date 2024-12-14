import * as nodemailer from 'nodemailer';
import { sender_email, email_password } from "../config";

export const emailService = async (
  to,
  subject,
  htmlTemplate,
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: sender_email,
      pass: email_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"Jimmy's Website" ${sender_email}`,
    to,
    subject,
    html: htmlTemplate,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`Email could not be sent to ${to} \n ${error}`);
    }
    console.log('Email sent: %s', info.messageId);
  });
};
