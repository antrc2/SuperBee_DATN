# Ví dụ khi gọi api

### khi lấy dữ liệu có phân trang

```js
import { useEffect, useState } from "react";
import LoadingDomain from "@components/Loading/LoadingDomain";
import NoProduct from "@components/Loading/NoProduct";
import BannerAndCart from "@sections/Home/BannerAndCart";
import api from "@utils/http";
import Pagination from "./Pagination";
import { useNotification } from "@contexts/NotificationProvider";
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const getData = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/home?page=${page}`);
      // categories phải là danh sách sản phẩm
      setCategories(res.data?.data?.categories);
      setPagination({
        current_page: json.data.current_page,
        last_page: json.data.last_page,
        total: json.data.total,
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  if (isLoading) return <LoadingDomain />;

  return (
    <div>
      <div className="mt-4">
        {categories?.length > 0 ? <BannerAndCart /> : <NoProduct />}
      </div>
      <Pagination meta={pagination} onPageChange={(page) => getData(page)} />
    </div>
  );
}
```

### khi lấy dữ liệu không phân trang

```js
import { useEffect, useState } from "react";
import LoadingDomain from "@components/Loading/LoadingDomain";
import NoProduct from "@components/Loading/NoProduct";
import BannerAndCart from "@sections/Home/BannerAndCart";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationProvider";
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const getData = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/home?page=${page}`);
      // categories phải là danh sách sản phẩm
      setCategories(res.data?.data?.categories);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  if (isLoading) return <LoadingDomain />;

  return (
    <div>
      <div className="mt-4">
        {categories?.length > 0 ? <BannerAndCart /> : <NoProduct />}
      </div>
    </div>
  );
}
```

### Thông báo

```js
import { useNotification } from "../../../contexts/NotificationProvider";
const { pop, conFim } = useNotification();
const hendelC = async () => {
  // ok sẽ trả về true hoặc false
  const ok = await conFim("Bạn có chắc không?");
  if (ok) {
    pop("Thực hiện thành công!", "s");
  } else {
    pop("Thực hiện thành công!", "e");
    pop("Thực hiện thành công!", "i");
  }
};
```
