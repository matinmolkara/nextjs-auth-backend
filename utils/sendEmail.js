const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try{
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER, // ایمیل فرستنده
        pass: process.env.GMAIL_APP_PASSWORD, // رمز عبور ایمیل فرستنده
      },
      tls: {
        rejectUnauthorized: false, // برای جلوگیری از خطای TLS
      },
    });
    await transporter.verify();
    console.log("SMTP server is ready to take our messages");
    const mailOptions ={
      from :{
        name:process.env.FROM_NAME || 'MyApp',
        address: process.env.GMAIL_USER, // ایمیل فرستنده
      },
      to,
      subject,
      html,

    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`, result.messageId);
    return result;

  } catch (error) {
    console.error("Gmail SMTP Error:", error);
    throw new Error("Failed to send email :" + error.message);
  }
};

module.exports = sendEmail;
