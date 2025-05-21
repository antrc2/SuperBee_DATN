export default function Home() {

  const { data, loading, error } = useFetch("/demo", "get");

  if (loading) return <p>Đang gửi yêu cầu...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;
  // console.log(data.message);

  return (
    <div>
      <h2>Kết quả:</h2>
      <h1>Trang chủ</h1>
    </div>
  );
}
