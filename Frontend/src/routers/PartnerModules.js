import React from "react"; // <-- Thêm dòng này

// TrangDanhSachAccGame không còn được import ở đây vì nó thuộc admin
// const TrangDanhSachAccGame = React.lazy(() => import("@pages/Admin/Products/TrangDanhSachAccGame")); // Xóa dòng này

const CreateProductsPartner = React.lazy(() =>
  import("../pages/Partner/Products/CreateProductsPartner")
);
const EditProductsPartner = React.lazy(() =>
  import("../pages/Partner/Products/EditProductsPartner")
);
const ProductDetailPagePartner = React.lazy(() =>
  import("../pages/Partner/Products/ProductDetailPagePartner")
);
const TrangDanhSachAccGamePartner = React.lazy(() =>
  import("../pages/Partner/Products/TrangDanhSachAccGame")
);

export const partnerModules = [
  {
    name: "products",
    list: TrangDanhSachAccGamePartner,
    show: ProductDetailPagePartner,
    create: CreateProductsPartner,
    edit: EditProductsPartner,
    allowedRoles: ["partner"],
  },
];
