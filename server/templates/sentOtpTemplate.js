const logo = require('../public/assets/favicon.png');

const sentOtpTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP for Password Reset</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background: #f4f4f4;
                margin: 0;
                padding: 0;
                text-align: center;
            }
            .container {
                max-width: 600px;
                background-color: #ffffff;
                margin: 20px auto;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
            }
            .header img {
                max-width: 140px;
                margin-bottom: 15px;
            }
            .header h2 {
                color: #333;
                font-size: 22px;
                margin-bottom: 8px;
            }
            .content {
                color: #555;
                font-size: 16px;
                line-height: 1.6;
                padding: 0 20px;
            }
            .otp {
                font-size: 24px;
                font-weight: bold;
                color: #007BFF;
                background: #e9f5ff;
                display: inline-block;
                padding: 12px 30px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #777;
            }
            .social-icons {
                margin-top: 10px;
            }
            .social-icons a {
                display: inline-block;
                margin: 0 8px;
                text-decoration: none;
            }
            .social-icons img {
                width: 28px;
                height: 28px;
                transition: transform 0.3s;
            }
            .social-icons img:hover {
                transform: scale(1.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logo}" alt="Scan My Meal">
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hi <strong>${name}</strong>,</p>
                <p>We received a request to reset your password for your Scan My Meal account. Use the OTP below to proceed:</p>
                <div class="otp">${otp}</div>
                <p>This OTP is valid for **10 minutes**. Do not share it with anyone.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>Need help? <a href="mailto:support@scanmymeal.com">Contact Support</a></p>
                <div class="social-icons">
                    <a href="https://github.com/rishabh-060">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733609.png" alt="GitHub">
                    </a>
                    <a href="www.linkedin.com/in/rishabh-verma-277530223">
                        <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn">
                    </a>
                    <a href="https://t.me/8881343585">
                        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram">
                    </a>
                </div>
                <p>© 2024 Scan My Meal. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = sentOtpTemplate;
