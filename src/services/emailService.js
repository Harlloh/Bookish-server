import { transporter } from "../utils/email.js";
import { getVerificationEmailTemplate } from "../utils/emailTemplates.js";

export const sendVerificationEmail = async (toEmail, verificationUrl, userName) => {
    try {
        const { subject, html, text } = getVerificationEmailTemplate(verificationUrl, userName);

        const mailOptions = {
            from: `Bookish <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: html,
            text: text,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Verification email sent', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending verification email:', error)
        throw new Error('Failed to send verification email');
    }
}