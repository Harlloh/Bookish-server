import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

//verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.log("email transporter error: ", error);
    } else {
        console.log("Email server is reay to send mails!");
    }
})