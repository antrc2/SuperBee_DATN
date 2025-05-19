import dayjs from "dayjs";
export function getCurrentDateTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

export function runAfter3Seconds(callback, time = 3000) {
  setTimeout(() => {
    callback(); // gọi hàm bạn truyền vào
  }, time);
}
