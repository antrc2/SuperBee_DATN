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
import SignIn from "@pages/Admin/AuthPages/SignIn";
import SignUp from "@pages/Admin/AuthPages/SignUp";

import UserProfiles from "@pages/Admin/UserProfiles";
import Videos from "@pages/Admin/UiElements/Videos";
import Images from "@pages/Admin/UiElements/Images";
import Alerts from "@pages/Admin/UiElements/Alerts";
import Badges from "@pages/Admin/UiElements/Badges";
import Avatars from "@pages/Admin/UiElements/Avatars";
import Buttons from "@pages/Admin/UiElements/Buttons";
import LineChart from "@pages/Admin/Charts/LineChart";
import BarChart from "@pages/Admin/Charts/BarChart";
import Calendar from "@pages/Admin/Calendar";
import BasicTables from "@pages/Admin/Tables/BasicTables";
import FormElements from "@pages/Admin/Forms/FormElements";
import Blank from "@pages/Admin/Blank";
import {
  CreateProducts,
  EditProducts,
  ListOrderPage,
  ProductDetailPage,
  ShowOrderPage,
} from "../pages";
export const adminModules = [
  {
    name: "profile",
    list: UserProfiles,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
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
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage,
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
    name: "badge",
    list: Badges,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "buttons",
    list: Buttons,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "images",
    list: Images,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "avatars",
    list: Avatars,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "alerts",
    list: Alerts,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "basic-tables",
    list: BasicTables,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "form-elements",
    list: FormElements,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "blank",
    list: Blank,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "videos",
    list: Videos,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "line-chart",
    list: LineChart,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "bar-chart",
    list: BarChart,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "signup",
    list: SignUp,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
  {
    name: "signin",
    list: SignIn,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    allowedRoles: ["admin"],
  },
];
