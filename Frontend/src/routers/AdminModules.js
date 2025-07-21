import React from "react"; // <-- Thêm dòng này
import EditCategoryPost from "../pages/Admin/CategoryPost/EditCategoryPostPage";
import NotFound from "../pages/NotFound/NotFound";

// Thay đổi các import trực tiếp thành React.lazy
const CategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/CategoryPage")
);
const CreateCategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/CreateCategoryPage")
);
const CreateCategoryPostPage = React.lazy(() =>
  import("@pages/Admin/CategoryPost/CreateCategoryPostPage.jsx")
);
const EditCategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/EditCategoryPage")
);
const DiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/DiscountCodePage")
);
const CreateDiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/CreateDiscountCodePage")
);
const EditDiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/EditDiscountCodePage")
);
const DonatePromotionDashboard = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/DonatePromotionDashboard")
);
const DonatePromotionPage = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/DonatePromotionPage")
);
const DonatePromotionDetail = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/DonatePromotionDetail")
);
const CreateDonatePromotionPage = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/CreateDonatePromotionPage")
);
const EditDonatePromotionPage = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/EditDonatePromotionPage")
);
const AccountListPage = React.lazy(() =>
  import("@pages/Admin/Account/AccountPage")
);
const ShowAccountPage = React.lazy(() =>
  import("@pages/Admin/Account/ShowAccountPage")
);
const ShowDiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/ShowDiscountCodePage")
);
const BannersListPage = React.lazy(() =>
  import("@pages/Admin/Banners/BannersListPage")
);
const BannerDetailPage = React.lazy(() =>
  import("@pages/Admin/Banners/BannerDetailPage")
);
const CreateBanners = React.lazy(() =>
  import("@pages/Admin/Banners/CreateBanners")
);
const EditBanner = React.lazy(() => import("@pages/Admin/Banners/EditBanner"));
const TrangDanhSachAccGame = React.lazy(() =>
  import("@pages/Admin/Products/TrangDanhSachAccGame")
);
const TrangDanhSachCategoryPost = React.lazy(() =>
  import("@pages/Admin/CategoryPost/TrangDanhSachCategoryPost")
);

const CreatePostPage = React.lazy(() =>
  import("../pages/Admin/Post/CreatePostPage")
);
const CreateProducts = React.lazy(() =>
  import("../pages/Admin/Products/CreateProducts")
);
const EditPostPage = React.lazy(() =>
  import("../pages/Admin/Post/EditPostPage")
);
const EditProducts = React.lazy(() =>
  import("../pages/Admin/Products/EditProducts")
);
const ListOrderPage = React.lazy(() =>
  import("../pages/Admin/Orders/ListOrderPage")
);
const ProductDetailPage = React.lazy(() =>
  import("../pages/Admin/Products/ProductDetailPage")
);
const ProductsBrowse = React.lazy(() =>
  import("../pages/Admin/Products/ProductsBrowse")
);
const ShowOrderPage = React.lazy(() =>
  import("../pages/Admin/Orders/ShowOrderPage")
);
const ShowPostPage = React.lazy(() =>
  import("../pages/Admin/Post/ShowPostPage")
);
const TrangDanhSachPost = React.lazy(() =>
  import("../pages/Admin/Post/TrangDanhSachPost")
);

const TrangDanhSachAccGameBrowse = React.lazy(() =>
  import("../pages/Admin/Products/TrangDanhSachAccGameBrowse")
);
const UpdateProductBrowse = React.lazy(() =>
  import("../pages/Admin/Products/UpdateProductBrowse")
);
const AgentDashboardPage = React.lazy(() =>
  import("../pages/AgentDashboard/AgentDashboardPage")
);
const RolesPage = React.lazy(() =>
  import("../pages/Admin/Authorization/RolesPage")
);
// const { UserListPage } = React.lazy(() =>
//   import("../pages/Admin/Authorization/UserRolesPage")
// );
import { UserListPage } from "../pages/Admin/Authorization/UserRolesPage";
const PermissionsPage = React.lazy(() =>
  import("../pages/Admin/Authorization/PermissionsPage")
);
const AuthorizationDashboardPage = React.lazy(() =>
  import("../pages/Admin/Authorization/AuthorizationDashboardPage")
);

export const adminModules = [
  {
    name: "authorization/permissions",
    list: PermissionsPage,
    create: NotFound, // Không cần trang riêng
    edit: NotFound, // Không cần trang riêng
    show: NotFound,
    allowedRoles: ["admin"],
  },
  {
    name: "authorization", // Route: /admin/authorization
    list: AuthorizationDashboardPage, // Trang tổng quan sẽ là trang chính
    create: NotFound,
    edit: NotFound,
    show: NotFound,
    allowedRoles: ["admin"],
  },
  {
    name: "authorization/roles",
    list: RolesPage,
    create: NotFound,
    edit: NotFound,
    show: NotFound,
    allowedRoles: ["admin"],
  },
  {
    name: "authorization/users",
    list: UserListPage,
    // Trang gán quyền sẽ được xử lý bằng route tùy chỉnh bên dưới
    create: NotFound,
    edit: NotFound,
    show: NotFound,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "discountcode",
    list: DiscountCodePage,
    create: CreateDiscountCodePage,
    edit: EditDiscountCodePage,
    show: ShowDiscountCodePage,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "donatePromotions",
    list: DonatePromotionDashboard,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    show: DonatePromotionDetail,
    allowedRoles: ["admin"],
  },
  {
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage,
    show: NotFound,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "users",
    list: AccountListPage,
    show: ShowAccountPage,
    edit: NotFound,
    create: NotFound,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "post",
    list: TrangDanhSachPost,
    show: ShowPostPage,
    create: CreatePostPage,
    edit: EditPostPage,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "products",
    list: TrangDanhSachAccGame,
    show: ProductDetailPage,
    create: CreateProducts,
    edit: EditProducts,
    allowedRoles: ["admin", "super-admin"],
    permissions: {
      create: "products.create", // Quyền cần có để vào trang "new"
      edit: "products.edit", // Quyền cần có để vào trang "edit"
    },
  },
  {
    name: "pendingProducts",
    list: TrangDanhSachAccGameBrowse,
    show: UpdateProductBrowse,
    edit: NotFound,
    create: NotFound,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "banners",
    list: BannersListPage,
    show: BannerDetailPage,
    create: CreateBanners,
    edit: EditBanner,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "orders",
    list: ListOrderPage,
    show: ShowOrderPage,
    create: NotFound,
    edit: NotFound,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "agent",
    list: AgentDashboardPage,
    show: ShowOrderPage,
    create: NotFound,
    edit: NotFound,
    allowedRoles: ["admin", "super-admin"],
  },
  {
    name: "categoryPost",
    list: TrangDanhSachCategoryPost,
    create: CreateCategoryPostPage,
    edit: EditCategoryPost,
    show: NotFound,
    allowedRoles: ["admin", "super-admin"],
  },
];
