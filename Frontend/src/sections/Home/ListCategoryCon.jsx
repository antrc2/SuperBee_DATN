import CategoryCon from "../../components/Client/Category/CategoryCon";

export default function ListCategoryCon({
  items = [],
  count = 5,
  title = "Danh mục"
}) {
  const displayedItems = items.slice(0, count); // Chỉ lấy đúng số lượng

  return (
    <div className="w-full my-4 max-w-7xl mx-auto mt-14">
      <div className="flex justify-between items-center mb-3 px-2">
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
          {title}
        </h2>
        <a href="#" className="text-sm text-blue-500 hover:underline">
          Xem tất cả →
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-2">
        {displayedItems.map((item, index) => (
          <CategoryCon key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
