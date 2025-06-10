import { Alert } from "antd";
// import { useEffect, useState } from "react";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import Header from "../../../components/Client/layout/Header";
import Banner3D from "../../../components/Client/banner/Banner";
import BannerAndCart from "../../../sections/Home/BannerAndCart";
import ListCategoryCha from "../../../sections/Home/ListCategoryCha";
import ListCategoryCon from "../../../sections/Home/ListCategoryCon";
import RechargeCard from "../RechargeCard/RechargeCard";
import { useEffect, useState } from "react";
import api from "../../../utils/http";
// import { useEffect, useState } from "react";
// import api from "../../../utils/http";
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const getCategory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/home");
      setCategories(res.data.data?.categories || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải danh sách danh mục:", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getCategory();
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
      <div>
        <ListCategoryCon
          items={categories.filter((item) => item.parent_id === 18)}
          count={5}
          title="KHO NICK LIÊN QUÂN"
        />
      </div>
      {/* {/* FF */}
      <div>
        <ListCategoryCon
          items={categories.filter((item) => item.parent_id === 7)}
          count={8}
          title="KHO NICK FREE FIRE"
        />
      </div>
      <div>
        <ListCategoryCon
          items={categories.filter((item) => item.parent_id === 6)}
          count={8}
          title="ACC BLOX FRUITS GIÁ RẺ"
        />
      </div>
    </div>
  );
}
