import CategoryForm from "@components/Admin/Category/CategoryForm";

export default function CreateCategoryPage() {
  const handleSave = (data) => {
    console.log("Create:", data);
  };

  return (
    <div className="p-6">
      <CategoryForm initialData={null} onSave={handleSave} />
    </div>
  );
}