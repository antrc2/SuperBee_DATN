import {

  TrangDanhSachAccGame,
} from "@pages";

import {
  CreateProductsPartner,
  EditProductsPartner,

  ProductDetailPagePartner,
  TrangDanhSachAccGamePartner,
} from "../pages";
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
