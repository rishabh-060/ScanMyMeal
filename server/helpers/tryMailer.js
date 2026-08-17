const nodemailer = require("nodemailer");
const logger = require('../utils/logger');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.NODEMAILER_App_id || !process.env.NODEMAILER_App_Pass) {
  throw new Error('Missing Gmail SMTP credentials. Set NODEMAILER_App_id and NODEMAILER_App_Pass in the mail-service .env file.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_App_id,
    pass: process.env.NODEMAILER_App_Pass,
  },
});

async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `Scan my Meal ${process.env.NODEMAILER_App_id}`,
      to,
      subject,
      text,
      html,
    });
    return {info, success : true}
  } catch (error) {
    logger.warn('email_delivery_failed', { error: error.message })
    return {error, success : false}
  }
}

module.exports = sendMail;
