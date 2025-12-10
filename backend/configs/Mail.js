import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});


const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html
  });
};


export default sendMail