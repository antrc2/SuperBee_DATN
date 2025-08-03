import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// --- SETUP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const APP_NAME = process.env.APP_NAME || "Your App";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Hệ thống";
const MAIL_FROM_ADDRESS =
  process.env.MAIL_FROM_ADDRESS || "noreply@example.com";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
    secure: parseInt(process.env.MAIL_PORT || "587", 10) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

// --- BASE EMAIL TEMPLATE ---
/**
 * Creates a consistent HTML wrapper for all emails with basic styling.
 * @param {string} contentHtml - The specific HTML content for the email body.
 * @param {string} subject - The subject of the email, used in the header.
 * @returns {string} Full HTML content for the email.
 */
function getStyledEmailTemplate(contentHtml, subject) {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body {
                font-family: 'Inter', Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                overflow: hidden;
            }
            .header {
                background-color: #007bff; /* Primary brand color */
                color: #ffffff;
                padding: 25px 30px;
                text-align: center;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .body-content {
                padding: 30px;
                line-height: 1.7;
                font-size: 16px;
            }
            .body-content p {
                margin-bottom: 15px;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .button {
                display: inline-block;
                background-color: #28a745; /* Success green */
                color: #ffffff;
                padding: 14px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 17px;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #218838;
            }
            .footer {
                background-color: #f0f0f0;
                color: #777;
                padding: 20px 30px;
                text-align: center;
                font-size: 14px;
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
                border-top: 1px solid #eee;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            .highlight {
                color: #007bff;
                font-weight: bold;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .item-list li {
                margin-bottom: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${APP_NAME}</h1>
            </div>
            <div class="body-content">
                ${contentHtml}
            </div>
            <div class="footer">
                <p>Bạn nhận được email này vì bạn là thành viên của ${APP_NAME}.</p>
                <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ <a href="mailto:${MAIL_FROM_ADDRESS}">${MAIL_FROM_ADDRESS}</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// --- EXPORTED EMAIL FUNCTIONS ---

/**
 * 1. Sends a welcome email after successful registration.
 * Corresponds to: `email_welcome`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} [data.loginUrl] Optional URL for direct login. Defaults to FRONTEND_URL.
 * @returns {Promise<void>}
 */
export async function sendWelcomeEmail(userEmail, { username, loginUrl }) {
  const transporter = createTransporter();
  const finalLoginUrl = loginUrl || `${FRONTEND_URL}/auth/login`;
  const subject = `Chào mừng đến với ${APP_NAME}!`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chào mừng bạn đã gia nhập cộng đồng của chúng tôi tại <span class="highlight">${APP_NAME}</span>! Chúng tôi rất vui được có bạn.</p>
        <p>Bạn đã sẵn sàng để khám phá các tài khoản game tuyệt vời chưa?</p>
        <div class="button-container">
            <a href="${finalLoginUrl}" class="button">Đăng nhập ngay</a>
        </div>
        <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
        <p>Chúc bạn có những trải nghiệm tuyệt vời!</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(`Sending welcome email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully!");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Could not send welcome email.");
  }
}

/**
 * 2. Sends an account verification email.
 * Corresponds to: `email_active_user` (email xác minh tài khoản)
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} data.verificationToken The unique token for verifying the account.
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(
  userEmail,
  { username, verificationToken }
) {
  const transporter = createTransporter();
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const subject = `Xác minh tài khoản của bạn tại ${APP_NAME}`;
  const htmlContent = `
        <h2>Chào mừng bạn, <span class="highlight">${username}</span>!</h2>
        <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào nút bên dưới để xác minh địa chỉ email của bạn:</p>
        <div class="button-container">
            <a href="${verificationUrl}" class="button">Xác minh tài khoản</a>
        </div>
        <p>Nếu bạn gặp sự cố với nút trên, hãy sao chép và dán liên kết này vào trình duyệt của bạn:</p>
        <p>Liên kết này sẽ hết hạn sau một thời gian ngắn. Vui lòng xác minh tài khoản của bạn càng sớm càng tốt.</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
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
 * 3. Sends a password reset email to a user.
 * Corresponds to: `email_forgot_password`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} data.resetToken The unique token for resetting the password.
 * @returns {Promise<void>}
 */

export async function ban_account(userEmail, {
  username
}) {
  const transporter = createTransporter();
  const subject = `Tài khoản của bạn đã bị cấm`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi xin thông báo rằng tài khoản của bạn đã bị cấm do vi phạm các điều khoản dịch vụ của chúng tôi.</p>
        <p>Nếu bạn tin rằng đây là một sai lầm, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(`Sending ban account email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Ban account email sent successfully!");
  } catch (error) {
    console.error("Error sending ban account email:", error);
    throw new Error("Could not send ban account email.");
  }
}

export async function restore_account(userEmail, {
  username
}) {
  const transporter = createTransporter();
  const subject = `Tài khoản của bạn đã được khôi phục`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi xin thông báo rằng tài khoản của bạn đã được khôi phục thành công.</p>
        <p>Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(`Sending restore account email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Restore account email sent successfully!");
  } catch (error) {
    console.error("Error sending restore account email:", error);
    throw new Error("Could not send restore account email.");
  }
}

export async function sendPasswordResetEmail(
  userEmail,
  { username, verificationToken }
) {
  const transporter = createTransporter();
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${verificationToken}`;
  const subject = `Đặt lại mật khẩu của bạn tại ${APP_NAME}`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng nhấp vào nút dưới đây để đặt lại:</p>
        <div class="button-container">
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
        </div>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
        <p>Liên kết này sẽ hết hạn sau một thời gian ngắn để đảm bảo an toàn cho tài khoản của bạn.</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
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
 * 4. Sends an order confirmation email.
 * Corresponds to: `email_order_confirmation`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} data.orderId The ID of the confirmed order.
 * @param {Array<{name: string, quantity: number, price: number}>} data.items List of items in the order.
 * @param {number} data.totalPrice The total price of the order.
 * @param {string} data.orderDate The date of the order (e.g., 'DD/MM/YYYY').
 * @param {string} [data.viewOrderUrl] Optional URL to view order details. Defaults to FRONTEND_URL/orders.
 * @returns {Promise<void>}
 */
export async function sendOrderConfirmationEmail(
  userEmail,
  { username, orderId, items, totalPrice, orderDate, viewOrderUrl }
) {
  const transporter = createTransporter();
  const finalViewOrderUrl = viewOrderUrl || `${FRONTEND_URL}/orders/${orderId}`;
  const subject = `Xác nhận đơn hàng #${orderId} của bạn tại ${APP_NAME}`;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td style="text-align: right;">${item.price.toLocaleString(
        "vi-VN"
      )} VND</td>
        </tr>
    `
    )
    .join("");

  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Cảm ơn bạn đã mua hàng tại <span class="highlight">${APP_NAME}</span>! Đơn hàng của bạn đã được xác nhận.</p>
        <p><strong>Mã đơn hàng:</strong> <span class="highlight">#${orderId}</span></p>
        <p><strong>Ngày đặt hàng:</strong> ${orderDate}</p>
        
        <h4>Chi tiết đơn hàng:</h4>
        <table>
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th style="text-align: right;">Giá</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr>
                    <td colspan="2" style="text-align: right; font-weight: bold;">Tổng cộng:</td>
                    <td style="text-align: right; font-weight: bold;">${totalPrice.toLocaleString(
    "vi-VN"
  )} VND</td>
                </tr>
            </tbody>
        </table>

        <div class="button-container">
            <a href="${finalViewOrderUrl}" class="button">Xem chi tiết đơn hàng</a>
        </div>
        <p>Thông tin tài khoản game sẽ được gửi đến bạn trong một email riêng ngay sau khi đơn hàng được xử lý thành công.</p>
        <p>Nếu có bất kỳ vấn đề gì, vui lòng liên hệ hỗ trợ của chúng tôi.</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(
      `Sending order confirmation email for #${orderId} to ${userEmail}...`
    );
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully!");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw new Error("Could not send order confirmation email.");
  }
}

/**
 * 5. Sends game account information after purchase.
 * Corresponds to: `email_info_account`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} data.productName The name of the game account/product purchased.
 * @param {string} data.gameAccountUser The username of the purchased game account.
 * @param {string} data.gameAccountPass The password of the purchased game account.
 * @param {string} [data.instructionsUrl] Optional URL for detailed instructions (e.g., how to change pass). Defaults to FRONTEND_URL/instructions.
 * @returns {Promise<void>}
 */
export async function sendAccountInfoEmail(
  userEmail,
  { username, productName, gameAccountUser, gameAccountPass, instructionsUrl }
) {
  const transporter = createTransporter();
  const finalInstructionsUrl =
    instructionsUrl || `${FRONTEND_URL}/instructions`;
  const subject = `Thông tin tài khoản ${productName} của bạn từ ${APP_NAME}`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúc mừng! Đơn hàng của bạn cho tài khoản <span class="highlight">${productName}</span> đã hoàn tất.</p>
        <p>Dưới đây là thông tin đăng nhập tài khoản của bạn:</p>
        <p style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
            <strong>Tên đăng nhập:</strong> <span style="color: #d9534f; font-weight: bold;">${gameAccountUser}</span><br>
            <strong>Mật khẩu:</strong> <span style="color: #d9534f; font-weight: bold;">${gameAccountPass}</span>
        </p>
        <p><strong>RẤT QUAN TRỌNG:</strong> Để bảo mật tài khoản, vui lòng thay đổi mật khẩu ngay lập tức sau khi đăng nhập thành công. Chúng tôi khuyến nghị bạn nên đổi tất cả các thông tin bảo mật liên quan đến tài khoản này.</p>
        <p>Bạn có thể tìm thấy hướng dẫn chi tiết về cách thay đổi mật khẩu và bảo mật tài khoản tại đây:</p>
        <div class="button-container">
            <a href="${finalInstructionsUrl}" class="button">Xem hướng dẫn bảo mật</a>
        </div>
        <p>Nếu bạn có bất kỳ thắc mắc hay cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.</p>
        <p>Chúc bạn có những giây phút chơi game vui vẻ!</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(
      `Sending account info email for ${productName} to ${userEmail}...`
    );
    await transporter.sendMail(mailOptions);
    console.log("Account info email sent successfully!");
  } catch (error) {
    console.error("Error sending account info email:", error);
    throw new Error("Could not send account info email.");
  }
}

/**
 * 6. Sends a profile update notification email.
 * Corresponds to: `email_info_me` (Email thông báo về thay đổi tài khoản cá nhân)
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {Array<string>} data.changedFields An array of strings indicating which fields were changed (e.g., ['Email', 'Password']).
 * @returns {Promise<void>}
 */
export async function sendProfileUpdateNotificationEmail(
  userEmail,
  { username, changedFields } // changedFields will now indicate 'password' or 'username'
) {
  const transporter = createTransporter();
  const subject = `Thông báo: Thông tin tài khoản ${APP_NAME} của bạn đã được cập nhật`;

  // Determine the type of change for the email message
  let changeMessage = "";
  if (changedFields.includes("password")) {
    changeMessage = "mật khẩu";
  } else if (changedFields.includes("username")) {
    changeMessage = "tên người dùng";
  } else {
    changeMessage = "thông tin tài khoản"; // Default if other fields change
  }

  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi muốn thông báo rằng ${changeMessage} tài khoản của bạn tại <span class="highlight">${APP_NAME}</span> vừa được cập nhật.</p>
        <p>Nếu bạn đã thực hiện thay đổi này, bạn có thể bỏ qua email này.</p>
        <p>Tuy nhiên, nếu bạn không thực hiện thay đổi này hoặc nghi ngờ có hoạt động đáng ngờ, vui lòng liên hệ ngay với bộ phận hỗ trợ của chúng tôi và thay đổi mật khẩu của bạn.</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(`Sending profile update notification email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Profile update notification email sent successfully!");
  } catch (error) {
    console.error("Error sending profile update notification email:", error);
    throw new Error("Could not send profile update notification email.");
  }
}
/**
 * 7. Sends a feedback request email.
 * Corresponds to: `email_feedback`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} data.productName The name of the product/service they provided feedback on.
 * @param {string} [data.feedbackUrl] Optional URL to the feedback form. Defaults to FRONTEND_URL/feedback.
 * @returns {Promise<void>}
 */
export async function sendFeedbackRequestEmail(
  userEmail,
  { username, productName, feedbackUrl }
) {
  const transporter = createTransporter();
  const finalFeedbackUrl = feedbackUrl || `${FRONTEND_URL}/feedback`;
  const subject = `Chúng tôi cần phản hồi của bạn về ${productName} - ${APP_NAME}`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi hy vọng bạn hài lòng với tài khoản <span class="highlight">${productName}</span> mà bạn đã mua!</p>
        <p>Tại <span class="highlight">${APP_NAME}</span>, chúng tôi luôn cố gắng cải thiện dịch vụ của mình. Phản hồi của bạn rất có giá trị đối với chúng tôi.</p>
        <p>Bạn có thể dành vài phút để chia sẻ trải nghiệm của mình không?</p>
        <div class="button-container">
            <a href="${finalFeedbackUrl}" class="button">Gửi phản hồi của bạn</a>
        </div>
        <p>Ý kiến của bạn sẽ giúp chúng tôi phục vụ tốt hơn nữa.</p>
        <p>Cảm ơn bạn đã ủng hộ!</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(
      `Sending feedback request email for ${productName} to ${userEmail}...`
    );
    await transporter.sendMail(mailOptions);
    console.log("Feedback request email sent successfully!");
  } catch (error) {
    console.error("Error sending feedback request email:", error);
    throw new Error("Could not send feedback request email.");
  }
}

/**
 * 8. Sends a promotional/marketing email.
 * Corresponds to: `email_promotional`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} data.promoTitle The title of the promotion (e.g., "Giảm giá lớn!").
 * @param {string} data.promoMessage The main message of the promotion.
 * @param {string} data.ctaButtonText Text for the call-to-action button.
 * @param {string} data.ctaButtonUrl URL for the call-to-action button.
 * @param {string} [data.imageUrl] Optional URL for a promotional image.
 * @param {string} [data.unsubscribeUrl] Optional URL for unsubscribing. Defaults to FRONTEND_URL/unsubscribe.
 * @returns {Promise<void>}
 */
export async function sendPromotionalEmail(
  userEmail,
  {
    username,
    promoTitle,
    promoMessage,
    ctaButtonText,
    ctaButtonUrl,
    imageUrl,
    unsubscribeUrl,
  }
) {
  const transporter = createTransporter();
  const finalUnsubscribeUrl = unsubscribeUrl || `${FRONTEND_URL}/unsubscribe`;
  const subject = `${promoTitle} | ${APP_NAME}`;
  const imageHtml = imageUrl
    ? `<p style="text-align: center; margin-bottom: 25px;"><img src="${imageUrl}" alt="${promoTitle}" style="max-width: 100%; height: auto; border-radius: 8px;"></p>`
    : "";

  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <h2>${promoTitle}</h2>
        ${imageHtml}
        <p>${promoMessage}</p>
        <div class="button-container">
            <a href="${ctaButtonUrl}" class="button">${ctaButtonText}</a>
        </div>
        <p>Đừng bỏ lỡ cơ hội này!</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
        <div style="text-align: center; margin-top: 40px; font-size: 13px; color: #999;">
            <p>Nếu bạn không muốn nhận các email khuyến mãi từ chúng tôi nữa, vui lòng <a href="${finalUnsubscribeUrl}" style="color: #999; text-decoration: underline;">hủy đăng ký tại đây</a>.</p>
        </div>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(`Sending promotional email '${promoTitle}' to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Promotional email sent successfully!");
  } catch (error) {
    console.error("Error sending promotional email:", error);
    throw new Error("Could not send promotional email.");
  }
}

/**
 * 9. Sends a support ticket confirmation email (automatic reply).
 * Corresponds to: `email_support`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data The data needed for the email.
 * @param {string} data.username The recipient's username.
 * @param {string} data.ticketId The ID of the support ticket.
 * @param {string} data.issueSummary A brief summary of the reported issue.
 * @param {string} data.expectedResponseTime Expected time frame for a response (e.g., "trong vòng 24 giờ").
 * @returns {Promise<void>}
 */
export async function sendSupportConfirmationEmail(
  userEmail,
  { username, ticketId, issueSummary, expectedResponseTime }
) {
  const transporter = createTransporter();
  const subject = `Xác nhận yêu cầu hỗ trợ của bạn #${ticketId} tại ${APP_NAME}`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn với mã số <span class="highlight">#${ticketId}</span>.</p>
        <p><strong>Vấn đề của bạn:</strong> ${issueSummary}</p>
        <p>Đội ngũ hỗ trợ của chúng tôi sẽ xem xét yêu cầu của bạn và phản hồi lại ${expectedResponseTime}.</p>
        <p>Trong thời gian chờ đợi, vui lòng không gửi thêm email mới cho cùng một vấn đề để tránh làm chậm quá trình xử lý.</p>
        <p>Cảm ơn bạn đã kiên nhẫn!</p>
        <p>Trân trọng,<br>Đội ngũ hỗ trợ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };

  try {
    console.log(
      `Sending support confirmation email for ticket #${ticketId} to ${userEmail}...`
    );
    await transporter.sendMail(mailOptions);
    console.log("Support confirmation email sent successfully!");
  } catch (error) {
    console.error("Error sending support confirmation email:", error);
    throw new Error("Could not send support confirmation email.");
  }
}

export async function sendMailDonate(userEmail, { username, amount }) {
  const transporter = createTransporter();
  const subject = `Cảm ơn bạn đã ủng hộ ${APP_NAME}`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi rất cảm kích sự ủng hộ của bạn với số tiền <span class="highlight">${amount}
    "vi-VN"
   VND</span>.</p>
        <p>Sự đóng góp của bạn sẽ giúp chúng tôi tiếp tục phát triển và cung cấp dịch vụ tốt nhất cho cộng đồng game thủ.</p>
        <p>Cảm ơn bạn đã đồng hành cùng chúng tôi!</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;
  console.log({
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_USER: process.env.MAIL_USER ? "[OK]" : "[MISSING]",
    MAIL_PASS: process.env.MAIL_PASS ? "[OK]" : "[MISSING]",
  });
  await transporter.verify(); // kiểm tra kết nối SMTP
  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
  };
  // console.log("Mail options:", mailOptions);
  try {
    console.log(`Sending donation email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Donation email sent successfully!");
  } catch (error) {
    console.error("Error sending donation email:", error);
    throw new Error("Could not send donation email.");
  }


}

/**
 * 10. Sends a domain notification email (if applicable to game accounts, e.g., for custom domains or specific game server domains).
 * Corresponds to: `email_domain`
 * @param {string} userEmail The recipient's email address.
 * @param {object} data Custom data for the email body.
 * @param {string} data.username The recipient's username.
 * @param {string} data.domainName The domain name related to the notification.
 * @param {string} data.message A specific message about the domain.
 * @returns {Promise<void>}
 */
export async function sendDomainEmail(
  userEmail,
  { username, domainName, message }
) {
  const transporter = createTransporter();
  const subject = `Thông báo về tên miền của bạn tại ${APP_NAME}`;
  const htmlContent = `
        <p>Xin chào <span class="highlight">${username}</span>,</p>
        <p>Chúng tôi có một thông báo quan trọng liên quan đến tên miền: <span class="highlight"><strong>${domainName}</strong></span></p>
        <p>${message}</p>
        <p>Vui lòng kiểm tra lại thông tin và liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.</p>
        <p>Trân trọng,<br>Đội ngũ ${APP_NAME}</p>
    `;

  const mailOptions = {
    from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
    to: userEmail,
    subject: subject,
    html: getStyledEmailTemplate(htmlContent, subject),
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

// --- EXAMPLE USAGE (for testing purposes) ---
// To run this example, ensure you have a .env file in the parent directory
// with the MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, etc. configurations.

// Example of how to use these functions (you would typically call these from your API routes or services)
const runExamples = async () => {
  const testEmail = "tuisuihikari@gmail.com"; // <-- THAY THẾ BẰNG EMAIL THẬT CỦA BẠN ĐỂ TEST
  const testUsername = "TestUser123";

  console.log("\n--- Running Email Sending Examples ---");

  try {
    // Example 1: Welcome Email
    await sendWelcomeEmail(testEmail, {
      username: testUsername,
      loginUrl: `${FRONTEND_URL}/dashboard`,
    });

    // Example 2: Verification Email
    await sendVerificationEmail(testEmail, {
      username: testUsername,
      verificationToken: "some-long-verification-token-12345",
    });

    // Example 3: Password Reset Email
    await sendPasswordResetEmail(testEmail, {
      username: testUsername,
      resetToken: "another-secret-reset-token-67890",
    });

    // Example 4: Order Confirmation Email
    await sendOrderConfirmationEmail(testEmail, {
      username: testUsername,
      orderId: "SB-20240626-001",
      items: [
        {
          name: "Tài khoản Liên Quân Mobile - Rank Kim Cương",
          quantity: 1,
          price: 500000,
        },
        {
          name: "Tài khoản Free Fire - Có Skin Hiếm",
          quantity: 1,
          price: 350000,
        },
      ],
      totalPrice: 850000,
      orderDate: "26/06/2024",
    });

    // Example 5: Account Info Email (simulated)
    await sendAccountInfoEmail(testEmail, {
      username: testUsername,
      productName: "Liên Minh Huyền Thoại - Rank Bạch Kim",
      gameAccountUser: "SummonerCoolGuy",
      gameAccountPass: "P@sswordSecure!", // In a real app, deliver securely, not directly in email
      instructionsUrl: `${FRONTEND_URL}/guides/secure-account`,
    });

    // Example 6: Profile Update Notification Email
    await sendProfileUpdateNotificationEmail(testEmail, {
      username: testUsername,
      changedFields: ["Mật khẩu", "Email liên hệ"],
    });

    // Example 7: Feedback Request Email
    await sendFeedbackRequestEmail(testEmail, {
      username: testUsername,
      productName: "Tài khoản Valorant",
    });

    // Example 8: Promotional Email
    await sendPromotionalEmail(testEmail, {
      username: testUsername,
      promoTitle: "Ưu Đãi Đặc Biệt: Giảm Giá Lên Đến 30% Toàn Bộ Tài Khoản!",
      promoMessage:
        "Hãy nhanh tay sở hữu những tài khoản game hot nhất với mức giá cực kỳ ưu đãi. Chương trình chỉ diễn ra trong thời gian có hạn!",
      ctaButtonText: "Mua ngay!",
      ctaButtonUrl: `${FRONTEND_URL}/deals`,
      imageUrl: "https://placehold.co/600x200/007bff/ffffff?text=Promo+Image", // Placeholder image
    });

    // Example 9: Support Confirmation Email
    await sendSupportConfirmationEmail(testEmail, {
      username: testUsername,
      ticketId: "SUP-20240626-A1B2C3",
      issueSummary: "Không thể đăng nhập vào tài khoản đã mua.",
      expectedResponseTime: "trong vòng 4 giờ làm việc",
    });

    // Example 10: Domain Email (less common for game accounts, but included for completeness)
    await sendDomainEmail(testEmail, {
      username: testUsername,
      domainName: "custom.superbee.game",
      message: "Tên miền tùy chỉnh của bạn đã được kích hoạt thành công!",
    });
  } catch (error) {
    console.error(
      "An error occurred during email sending examples:",
      error.message
    );
  }

  console.log("\n--- Email Sending Examples Finished ---");
};

// Uncomment the line below to run the examples when this file is executed directly.
// runExamples();
