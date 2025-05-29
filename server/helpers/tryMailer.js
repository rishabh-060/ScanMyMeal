const nodemailer = require("nodemailer");
const { default: verifyEmailTemplate } = require("../templates/verifyEmailTemplate");
const dotenv = require('dotenv');

dotenv.config({path : '../config/config.env'})

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
    // console.log("Email sent:", info);
    return {info, success : true}
  } catch (error) {
    // console.error("Email sending :", error);
    return {error, success : false}
  }
}

module.exports = sendMail;