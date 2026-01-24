export const getVerificationEmailTemplate = (verificationUrl, userName) => {
    return {
        subject: 'Verify Your Email - Bookish',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #666;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <h2>Welcome to Bookish, ${userName}! 📚</h2>
                        <p>Thank you for registering! Please verify your email address to activate your account.</p>
                        <p>Click the button below to verify your email:</p>
                        <a href="${verificationUrl}" class="button">Verify Email</a>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                        <p><strong>This link will expire in 10 minutes.</strong></p>
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Bookish. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            Welcome to Bookish, ${userName}!
            
            Thank you for registering! Please verify your email address to activate your account.
            
            Click this link to verify: ${verificationUrl}
            
            This link will expire in 10 minutes.
            
            If you didn't create an account, you can safely ignore this email.
        `
    };
};