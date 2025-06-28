import {
  CategoryPage,
  CreateCategoryPage,
  EditCategoryPage,
  DiscountCodePage,
  CreateDiscountCodePage,
  EditDiscountCodePage,
  DonatePromotionPage,
  CreateDonatePromotionPage,
  EditDonatePromotionPage,
  AccountListPage,
  ShowAccountPage,
  ShowDiscountCodePage,
  BannersListPage,
  BannerDetailPage,
  CreateBanners,
  EditBanner,
  TrangDanhSachAccGame,
} from "@pages";

import {
  CreateProducts,
  EditProducts,
  ListOrderPage,
  ProductDetailPage,
  ProductsBrowse,
  ShowOrderPage,
} from "../pages";
import TrangDanhSachAccGameBrowse from "../pages/Admin/Products/TrangDanhSachAccGameBrowse";
import UpdateProductBrowse from "../pages/Admin/Products/UpdateProductBrowse";
import AgentDashboardPage from "../pages/AgentDashboard/AgentDashboardPage";
export const adminModules = [
  {
    name: "discountcode",
    list: DiscountCodePage,
    create: CreateDiscountCodePage,
    edit: EditDiscountCodePage,
    show: ShowDiscountCodePage,
    allowedRoles: ["admin"],
  },
  {
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage,
    allowedRoles: ["admin"],
  },
  {
    name: "users",
    list: AccountListPage,
    show: ShowAccountPage,
    allowedRoles: ["admin"],
  },
  {
    name: "products",
    list: TrangDanhSachAccGame,
    show: ProductDetailPage,
    create: CreateProducts,
    edit: EditProducts,
    browse: TrangDanhSachAccGameBrowse,
    update: UpdateProductBrowse,
    allowedRoles: ["admin"],
  },
  {
    name: "banners",
    list: BannersListPage,
    show: BannerDetailPage,
    create: CreateBanners,
    edit: EditBanner,
    allowedRoles: ["admin"],
  },
  {
    name: "orders",
    list: ListOrderPage,
    show: ShowOrderPage,
    allowedRoles: ["admin"],
  },
  {
    name: "agent",
    list: AgentDashboardPage,
    show: ShowOrderPage,
    allowedRoles: ["admin"],
  },
];
