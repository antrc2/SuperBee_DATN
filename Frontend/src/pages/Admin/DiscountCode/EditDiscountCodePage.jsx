import { useParams } from "react-router-dom";
import DiscountCodeForm from "@components/Admin/DiscountCode/DiscountCodeForm";

const EditDiscountCodePage = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa mã giảm giá #{id}</h1>
      <DiscountCodeForm isEdit={true} id={id} />
    </div>
  );
};

export default EditDiscountCodePage;