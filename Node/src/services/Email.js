// File: sendPasswordResetEmail.js
// ---------------------------------
// This module handles sending the password reset email using Nodemailer and ES Modules syntax.

import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// --- SETUP ---
// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from a .env file located in the parent directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// --- TRANSPORTER FACTORY ---
// A helper function to create a configured transporter instance.
// This avoids repeating the same configuration in every function.
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
    secure: parseInt(process.env.MAIL_PORT || "587", 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // Your SMTP username
      pass: process.env.MAIL_PASS, // Your SMTP password
    },
  });
}

// --- EXPORTED EMAIL FUNCTIONS ---

/**
 * 1. Sends a password reset email to a user.
 * @param {string} userEmail The recipient's email address.
 * @param {string} username The recipient's username to personalize the email.
 * @param {string} resetToken The unique token for resetting the password.
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(userEmail, username, resetToken) {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: `Đặt lại mật khẩu của bạn tại ${process.env.APP_NAME}`,
    html: `<p>Xin chào ${username},</p><p>Nhấp vào liên kết sau để đặt lại mật khẩu của bạn: <a href="${resetUrl}">Đặt lại mật khẩu</a></p>`,
  };

  try {
    console.log(`Sending password reset email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully!");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Could not send password reset email.");
  }
}

/**
 * 2. Sends an account verification email.
 * @param {string} userEmail The recipient's email address.
 * @param {string} username The recipient's username to personalize the email.
 * @param {string} verificationToken The unique token for verifying the account.
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(
  userEmail,
  username,
  verificationToken
) {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: `Xác minh tài khoản của bạn tại ${process.env.APP_NAME}`,
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Chào mừng bạn, ${username}!</h2>
                <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào nút bên dưới để xác minh địa chỉ email của bạn:</p>
                <p style="text-align: center;">
                    <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Xác minh tài khoản</a>
                </p>
                <p>Trân trọng,<br>Đội ngũ ${process.env.APP_NAME}</p>
            </div>
        `,
  };

  try {
    console.log(`Sending verification email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Could not send verification email.");
  }
}

/**
 * 3. Sends an active user notification email.
 * Corresponds to the 'SendEmailActiveUser' Mailable.
 * @param {string} userEmail The recipient's email address.
 * @param {object} data Custom data for the email body.
 * @returns {Promise<void>}
 */
export async function sendActiveUserEmail(userEmail, data) {
  const transporter = createTransporter();
  // Since we don't have the Blade template, we create a generic HTML body.
  // You can customize this HTML extensively.
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: "Thông báo kích hoạt người dùng", // Or use data.subject if provided
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h3>Thông báo quan trọng</h3>
                <p>Xin chào,</p>
                <p>Đây là thông báo liên quan đến việc kích hoạt tài khoản của bạn.</p>
                <p>Chi tiết: ${data.message || "Không có chi tiết cụ thể."}</p>
                <p>Trân trọng,<br>Đội ngũ ${process.env.APP_NAME}</p>
            </div>
        `,
  };

  try {
    console.log(`Sending active user email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Active user email sent successfully!");
  } catch (error) {
    console.error("Error sending active user email:", error);
    throw new Error("Could not send active user email.");
  }
}

/**
 * 4. Sends a domain notification email.
 * Corresponds to the 'SendEmailDomain' Mailable.
 * @param {string} userEmail The recipient's email address.
 * @param {object} data Custom data for the email body.
 * @returns {Promise<void>}
 */
export async function sendDomainEmail(userEmail, data) {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: "Thông báo về tên miền", // Or use data.subject if provided
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h3>Thông báo về tên miền</h3>
                <p>Xin chào,</p>
                <p>Đây là thông báo liên quan đến tên miền của bạn: <strong>${
                  data.domainName || "N/A"
                }</strong></p>
                <p>Nội dung: ${data.message || "Không có chi tiết cụ thể."}</p>
                <p>Trân trọng,<br>Đội ngũ ${process.env.APP_NAME}</p>
            </div>
        `,
  };

  try {
    console.log(`Sending domain notification email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Domain notification email sent successfully!");
  } catch (error) {
    console.error("Error sending domain email:", error);
    throw new Error("Could not send domain email.");
  }
}

const send = async () => {
  await sendVerificationEmail(
    "hairobet15092005@gmail.com",
    '"Tran Haisss',
    "lkjasdfljsadlfjlfjlasjf"
  );
};
send();
