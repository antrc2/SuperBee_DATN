// Định nghĩa các loại email bằng cách sử dụng một đối tượng hằng số
const EmailType = {
  EMAIL_WELCOME: "EMAIL_WELCOME",
  EMAIL_ACTIVE_USER: "EMAIL_ACTIVE_USER",
  EMAIL_DOMAIN: "EMAIL_DOMAIN",
  EMAIL_FORGOT_PASSWORD: "EMAIL_FORGOT_PASSWORD",
  EMAIL_ORDER_CONFIRMATION: "EMAIL_ORDER_CONFIRMATION",
  EMAIL_INFO_ACCOUNT: "EMAIL_INFO_ACCOUNT",
  EMAIL_INFO_ME: "EMAIL_INFO_ME",
  EMAIL_FEEDBACK: "EMAIL_FEEDBACK",
  EMAIL_PROMOTIONAL: "EMAIL_PROMOTIONAL",
  EMAIL_SUPPORT: "EMAIL_SUPPORT",
  EMAIL_DONATE: "EMAIL_DONATE", // Email thông báo về ủng hộ
  EMAIL_BAN_ACCOUNT: "EMAIL_BAN_ACCOUNT", // Email thông báo tài khoản bị cấm
  EMAIL_RESTORE_ACCOUNT: "EMAIL_RESTORE_ACCOUNT", // Email thông báo tài khoản được khôi phục
};
import * as email from "../services/Email.js";
async function sendEmail(type, data) {
  const toEmail = data?.email;
  const username = data?.username;
  const loginUrl = data?.loginUrl;
  const verificationToken = data?.verificationToken;
  const domainName = data?.domainName;
  const message = data?.message;
  const changedFields = data?.changedFields;
  const amount = data?.amount;
  switch (type) {
    case EmailType.EMAIL_WELCOME:
      if (toEmail && username && loginUrl) {
        console.log("Gửi email chào mừng(EMAIL_WELCOME)");
        await email.sendWelcomeEmail(toEmail, { username, loginUrl });
      }
      break;

    case EmailType.EMAIL_ACTIVE_USER:
      // email_active_user: email xác minh tài khoản
      if (toEmail && username && verificationToken) {
        console.log("Gửi email xác minh tài khoản (EMAIL_ACTIVE_USER)");
        await email.sendVerificationEmail(toEmail, {
          username,
          verificationToken,
        });
      }

      // TODO: Thêm logic gửi email xác minh tài khoản tại đây
      break;

    case EmailType.EMAIL_DOMAIN:
      // email_domain: email kích hoạt domain (ít phổ biến trong hệ thống bán acc game)
      if (toEmail && username && domainName && message) {
        console.log("Gửi email kích hoạt domain (EMAIL_DOMAIN)");
        await email.sendDomainEmail(toEmail, {
          username,
          domainName,
          message,
        });
      }
      break;

    case EmailType.EMAIL_FORGOT_PASSWORD:
      // email_forgot_password: email quên mật khẩu
      if (toEmail && username && verificationToken) {
        console.log("Gửi email đặt lại mật khẩu (EMAIL_FORGOT_PASSWORD)");
        await email.sendPasswordResetEmail(toEmail, {
          username,
          verificationToken,
        });
      }
      break;
    case EmailType.EMAIL_BAN_ACCOUNT:
      // email_ban_account: Email thông báo tài khoản bị cấm
      console.log("Gửi email thông báo tài khoản bị cấm (EMAIL_BAN_ACCOUNT)");
      await email.ban_account(toEmail, { username });
      break;
    case EmailType.EMAIL_RESTORE_ACCOUNT:
      // email_restore_account: Email thông báo tài khoản được khôi phục
      console.log("Gửi email thông báo tài khoản được khôi phục (EMAIL_RESTORE_ACCOUNT)");
      await email.restore_account(toEmail, { username });
      break;
    case EmailType.EMAIL_ORDER_CONFIRMATION:
      // email_order_confirmation: Email xác nhận đơn hàng
      console.log("Gửi email xác nhận đơn hàng (EMAIL_ORDER_CONFIRMATION)");
      // TODO: Thêm logic gửi email xác nhận đơn hàng tại đây
      break;

    case EmailType.EMAIL_INFO_ACCOUNT:
      // email_info_account: Email gửi thông tin tài khoản (sau khi mua)
      console.log("Gửi email thông tin tài khoản đã mua (EMAIL_INFO_ACCOUNT)");
      // TODO: Thêm logic gửi thông tin tài khoản tại đây
      break;

    case EmailType.EMAIL_INFO_ME:
      // email_info_me: Email thông báo về thay đổi tài khoản (thông tin cá nhân/hồ sơ)
      if (toEmail && username && changedFields) {
        console.log(
          "Gửi email thông báo thay đổi thông tin tài khoản cá nhân (EMAIL_INFO_ME)"
        );
        await email.sendProfileUpdateNotificationEmail(toEmail, {
          username,
          changedFields,
        });
      }
      break;
    
    case EmailType.EMAIL_DONATE:
      // email_donate: Email thông báo về ủng hộ
      if (toEmail && username && amount) {
        console.log("Gửi email thông báo ủng hộ (EMAIL_DONATE)");
        await email.sendMailDonate(toEmail, { username, amount });
      }   
      break;


    case EmailType.EMAIL_FEEDBACK:
      // email_feedback: Email khảo sát/phản hồi
      console.log("Gửi email khảo sát/phản hồi (EMAIL_FEEDBACK)");
      // TODO: Thêm logic gửi email khảo sát/phản hồi tại đây
      break;

    case EmailType.EMAIL_PROMOTIONAL:
      // email_promotional: Email khuyến mãi/ưu đãi
      console.log("Gửi email khuyến mãi/ưu đãi (EMAIL_PROMOTIONAL)");
      // TODO: Thêm logic gửi email khuyến mãi/ưu đãi tại đây
      break;

    case EmailType.EMAIL_SUPPORT:
      // email_support: Email hỗ trợ khách hàng (thường là trả lời tự động khi nhận được yêu cầu)
      console.log("Gửi email hỗ trợ khách hàng (EMAIL_SUPPORT)");
      // TODO: Thêm logic gửi email hỗ trợ khách hàng tại đây
      break;

    default:
      console.log("Loại email không xác định.");
      break;
  }
}

// --- Ví dụ về cách sử dụng ---
// console.log("--- Bắt đầu ví dụ ---");

// sendEmail(EmailType.EMAIL_WELCOME);
// sendEmail(EmailType.EMAIL_ORDER_CONFIRMATION);
// sendEmail(EmailType.EMAIL_SUPPORT);
// sendEmail("EMAIL_UNKNOWN"); // Thử với một loại không xác định

// console.log("--- Kết thúc ví dụ ---");
export { sendEmail };
