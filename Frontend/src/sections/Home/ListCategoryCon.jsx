import CategoryCon from "../../components/Client/Category/CategoryCon";

export default function ListCategoryCon({
  items = [],
  count = 5,
  title = "Danh mục",
}) {
  if (!items.length || !items[0]?.children) return null; // Kiểm tra nếu không có dữ liệu
  const displayedItems = items[0]?.children.slice(0, count); // Chỉ lấy đúng số lượng

  return (
    <div className="w-full  max-w-7xl mx-auto ">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
          {title}
        </h2>
        <a href="#" className="text-sm text-blue-500 hover:underline">
          Xem tất cả →
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayedItems.map((item, index) => (
          <CategoryCon key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
