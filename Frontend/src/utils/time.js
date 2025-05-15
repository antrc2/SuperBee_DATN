import dayjs from "dayjs";
export function getCurrentDateTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}
