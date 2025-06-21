import CategoryCon from "../../components/Client/Category/CategoryCon";
import NoProduct from "../../components/Loading/NoProduct";

export default function ListCategoryCon({
  items = [],
  count = 5,
  title = null,
}) {
  if (!items.length || !items[0]?.children) return <NoProduct />;
  const displayedItems = items[0]?.children.slice(0, count); // Chỉ lấy đúng số lượng

  return (
    <div className="w-full  max-w-7xl mx-auto ">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 flex items-center gap-2">
          {title}
        </h2>
        <a
          href="#"
          className="text-sm hover:underline font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
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
