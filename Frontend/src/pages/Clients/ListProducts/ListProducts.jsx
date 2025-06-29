import React from "react";
import { useEffect, useState } from "react";
import Product from "../../../components/Client/product/Product";
import LoadingDomain from "@components/Loading/LoadingDomain";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import { useParams } from "react-router-dom";
import api from "@utils/http";
import NoProduct from "../../../components/Loading/NoProduct";
export default function ListProducts() {
  // const navigate = useNavigate();
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({});
  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/${slug}`);
      setProducts(res.data?.data?.products);
      setCategory(res.data?.data?.category);
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
    <>
      <div className="max-w-7xl mx-auto mt-5">
        <Breadcrumbs category={category} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto">
        {products?.map((product, index) => (
          <Product key={index} product={product} />
        ))}
      </div>
      {products.length === 0 && <NoProduct />}
    </>
  );
}
