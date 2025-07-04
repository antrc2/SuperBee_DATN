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
      {/* LQ */}
      <div className="mt-8">
        <ListCategoryCon
          items={homeData?.categories?.onlyChildren?.filter((e) => e.id == 18)}
          count={5}
          title="KHO NICK LIÊN QUÂN"
        />
      </div>
      {/* {/* FF */}
      <div className="mt-8">
        <ListCategoryCon
          items={homeData?.categories?.onlyChildren?.filter((e) => e.id == 7)}
          count={8}
          title="KHO NICK FREE FIRE"
        />
      </div>
    </div>
  );
}
