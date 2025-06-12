import DiscountCodeForm from "@components/Admin/DiscountCode/DiscountCodeForm";

const CreateDiscountCodePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thêm mã giảm giá</h1>
      <DiscountCodeForm />
    </div>
  );
};

export default CreateDiscountCodePage;
