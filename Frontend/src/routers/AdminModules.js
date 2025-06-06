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


export const adminModules = [
  {
    name: "profile",
    list: UserProfiles,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage
  },
  {
    name: "users",
    list: AccountListPage,
    show: ShowAccountPage,
  },
  {
    name: "calendar",
    list: Calendar,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "badge",
    list: Badges,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "buttons",
    list: Buttons,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "images",
    list: Images,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "avatars",
    list: Avatars,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "alerts",
    list: Alerts,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "basic-tables",
    list: BasicTables,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "form-elements",
    list: FormElements,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "blank",
    list: Blank,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "videos",
    list: Videos,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "line-chart",
    list: LineChart,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "bar-chart",
    list: BarChart,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "signup",
    list: SignUp,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  },
  {
    name: "signin",
    list: SignIn,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  }
];
