import { useEffect, useState } from "react";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import BannerAndCart from "../../../sections/Home/BannerAndCart";
import ListCategoryCha from "../../../sections/Home/ListCategoryCha";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import api from "../../../utils/http";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/home");
      if (res.data.status) {
        const d = {
          categories: res.data?.data?.categories ?? [],
          banners: res.data?.data?.banners ?? [],
          top: res.data?.data?.top ?? [],
        };
        setData({ ...d });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  if (isLoading) return <LoadingDomain />;

  return (
    <div>
      <div className="mt-4">
        <BannerAndCart top={data?.top ?? []} banner={data?.banners ?? []} />
      </div>
      <div>
        <ListCategoryCha categories={data?.categories ?? []} />
      </div>
      {/* LQ */}
      <div className="mt-8">
        <ListCategoryCon
          items={data?.categories?.filter((e) => e.id == 18)}
          count={5}
          title="KHO NICK LIÊN QUÂN"
        />
      </div>
      {/* {/* FF */}
      <div className="mt-8">
        <ListCategoryCon
          items={data?.categories?.filter((e) => e.id == 7)}
          count={8}
          title="KHO NICK FREE FIRE"
        />
      </div>
    </div>
  );
}
