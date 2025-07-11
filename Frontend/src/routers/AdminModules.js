import React from "react"; // <-- Thêm dòng này

// Thay đổi các import trực tiếp thành React.lazy
const CategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/CategoryPage")
);
const CreateCategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/CreateCategoryPage")
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
const DonatePromotionPage = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/DonatePromotionPage")
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
    name: "post",
    list: TrangDanhSachPost,
    show: ShowPostPage,
    create: CreatePostPage,
    edit: EditPostPage,
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
