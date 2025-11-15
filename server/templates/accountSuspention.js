const logo = require('../public/assets/favicon.png');

const accountSuspension = (userName, suspensionDate, reason) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Account Suspension Notice</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                text-align: center;
            }
            .container {
                max-width: 600px;
                margin: 30px auto;
                background: #ffffff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
            }
            .header img {
                max-width: 140px;
                margin-bottom: 10px;
            }
            .header h2 {
                font-size: 22px;
                color: #d9534f;
                margin: 10px 0;
            }
            .content {
                font-size: 16px;
                color: #555;
                line-height: 1.6;
                padding: 0 20px;
            }
            .highlight {
                background: #ffe6e6;
                color: #d9534f;
                padding: 10px;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                display: inline-block;
            }
            .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #777;
            }
            .footer a {
                color: #007BFF;
                text-decoration: none;
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
                <img src="${logo}" alt="Scan My Meal" />
                <h2>Account Suspension Notice</h2>
            </div>
            <div class="content">
                <p>Dear <strong>${userName}</strong>,</p>
                <p>We regret to inform you that your account has been suspended as of <strong>${suspensionDate}</strong>.</p>
                <div class="highlight">Reason: ${reason}</div>
                <p>If you believe this is a mistake, please reach out to our support team at your earliest convenience.</p>
                <p>We appreciate your understanding and cooperation.</p>
            </div>
            <div class="footer">
                <p>Need help? <a href="mailto:support@scanmymeal.com">Contact Support</a></p>
                <div class="social-icons">
                    <a href="https://github.com/rishabh-060">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733609.png" alt="GitHub">
                    </a>
                    <a href="https://www.linkedin.com/in/rishabh-verma-277530223">
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
};

module.exports = accountSuspension;
