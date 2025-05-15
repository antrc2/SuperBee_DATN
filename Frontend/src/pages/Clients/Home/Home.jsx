import { showNotification } from "@utils/notification.js";
import { useEffect } from "react";
import { showConfirm } from "../../../utils/notification";

export default function Home() {
  useEffect(() => {
    showNotification("warning", "Đây là thông báo thông tin!", 4000);
    showConfirm("bạn chắc chứ", "Đăng Xuất");
  }, []);
  return (
    <div>
      <div className="space-x-2">hello</div>
    </div>
  );
}
