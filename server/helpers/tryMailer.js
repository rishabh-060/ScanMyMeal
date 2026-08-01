const nodemailer = require("nodemailer");
const logger = require('../utils/logger')

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
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
