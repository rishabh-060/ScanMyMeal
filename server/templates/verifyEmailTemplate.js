const logo = require('../public/assets/favicon.png');

const verifyEmailTemplate = (name, url) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
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
                font-size: 24px;
                margin-bottom: 8px;
            }
            .content {
                color: #555;
                font-size: 16px;
                line-height: 1.6;
                padding: 0 20px;
            }
            .button {
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 14px 35px;
                margin: 20px 0;
                text-decoration: none;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.2);
                transition: all 0.3s;
            }
            .button:hover {
                background: #218838;
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
            .unsubscribe {
                margin-top: 15px;
                font-size: 12px;
                color: #999;
            }
            .unsubscribe a {
                color: #007BFF;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logo}" alt="Scan My Meal">
                <h2>Welcome to Scan My Meal</h2>
            </div>
            <div class="content">
                <p>Hi <strong>${name}</strong>,</p>
                <p>You're just one step away from getting started! Click the button below to verify your email and activate your account.</p>
                <a href="${url}" class="button">Verify My Email</a>
                <p>If you did not sign up for Scan My Meal, please ignore this email.</p>
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
                <p class="unsubscribe">You received this email because you signed up for Scan My Meal. If this wasn’t you, <a href="#">unsubscribe here</a>.</p>
                <p>© 2024 Scan My Meal. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  };
  
module.exports = verifyEmailTemplate;
  