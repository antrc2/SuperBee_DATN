import CategoryCha from "../../components/Client/Category/CategoryCha";

export default function ListCategoryCha({ categories }) {
  const cate = categories.filter((e) => e.parent_id === null) || [];

  return (
    <div className="flex gap-2 justify-between px-16 max-w-7xl mx-auto mt-10">
      {cate.map((acc) => (
        <CategoryCha key={acc.id} item={acc} />
      ))}
    </div>
  );
}
