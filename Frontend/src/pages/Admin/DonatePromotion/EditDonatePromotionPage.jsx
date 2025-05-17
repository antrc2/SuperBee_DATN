import { useParams } from "react-router-dom";
import DonatePromotionForm from "@components/Admin/DonatePromotion/DonatePromotionForm";

const EditDonatePromotionPage = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chỉnh sửa khuyến mãi #{id}</h1>
      <DonatePromotionForm isEdit={true} id={id} />
    </div>
  );
};

export default EditDonatePromotionPage;