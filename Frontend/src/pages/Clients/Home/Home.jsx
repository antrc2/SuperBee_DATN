import { useFetch } from "@utils/hook";

export default function Home() {
  const { data, loading, error } = useFetch("/domain", "get");

  if (loading) return <p>Đang gửi yêu cầu...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;
  console.log(data.message);
  return (
    <div>
      <h2>Kết quả:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
