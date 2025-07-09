import LoadingDomain from "../../../components/Loading/LoadingDomain";
import BannerAndCart from "../../../sections/Home/BannerAndCart";
import CategorySlider from "../../../sections/Home/ListCategoryCha";
import { useHome } from "@contexts/HomeContext";
import ListProductsHome from "../../../sections/Home/ListProducyts";

export default function Home() {
  const { homeData } = useHome();
  console.log("🚀 ~ Home ~ homeData:", homeData);
  return (
    <div className="p-4">
      <div className="">
        <BannerAndCart
          top={homeData?.top ?? []}
          banner={homeData?.banners ?? []}
        />
      </div>
      <div className="mt-9">
        <CategorySlider categories={homeData?.categories?.onlyChildren ?? []} />
      </div>
      <div className="mt-9">
        <ListProductsHome ListProducts={homeData?.products ?? []} />
      </div>
    </div>
  );
}
