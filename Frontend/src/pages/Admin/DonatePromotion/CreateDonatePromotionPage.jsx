import DonatePromotionForm from "@components/Admin/DonatePromotion/DonatePromotionForm";

const CreateDonatePromotionPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thêm khuyến mãi nạp thẻ</h1>
      <DonatePromotionForm />
    </div>
  );
};

export default CreateDonatePromotionPage;