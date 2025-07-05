import LoadingDomain from "../../../components/Loading/LoadingDomain";
import BannerAndCart from "../../../sections/Home/BannerAndCart";
import ListCategoryCha from "../../../sections/Home/ListCategoryCha";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import { useHome } from "@contexts/HomeContext";

export default function Home() {
  const { homeData } = useHome();
  return (
    <div className="bg-gradient-header">
      <div>
        <BannerAndCart
          top={homeData?.top ?? []}
          banner={homeData?.banners ?? []}
        />
      </div>
      <div>
        <ListCategoryCha
          categories={homeData?.categories?.onlyChildren ?? []}
        />
      </div>
    </div>
  );
}
