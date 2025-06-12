import { useEffect, useState } from "react";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import BannerAndCart from "../../../sections/Home/BannerAndCart";
import ListCategoryCha from "../../../sections/Home/ListCategoryCha";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import api from "../../../utils/http";
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/home");
      setCategories(res.data?.data?.categories);
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
        <BannerAndCart />
      </div>
      <div>
        <ListCategoryCha categories={categories} />
      </div>
      {/* LQ */}
      <div className="mt-8">
        <ListCategoryCon
          items={categories.filter((e) => e.id == 18)}
          count={5}
          title="KHO NICK LIÊN QUÂN"
        />
      </div>
      {/* {/* FF */}
      <div className="mt-8">
        <ListCategoryCon
          items={categories.filter((e) => e.id == 7)}
          count={8}
          title="KHO NICK FREE FIRE"
        />
      </div>
    </div>
  );
}
