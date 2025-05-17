
import CategoryPage         from "@pages/Admin/Category/CategoryPage";
import CreateCategoryPage   from "@pages/Admin/Category/CreateCategoryPage";
import EditCategoryPage     from "@pages/Admin/Category/EditCategoryPage";

import DiscountCodePage from "@pages/Admin/DiscountCode/DiscountCodePage";
import CreateDiscountCodePage from "@pages/Admin/DiscountCode/CreateDiscountCodePage";
import EditDiscountCodePage from "@pages/Admin/DiscountCode/EditDiscountCodePage";


export const adminModules = [
  {
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage,
  },
  
  {
    name: "discount-codes",
    list: DiscountCodePage,
    create: CreateDiscountCodePage,
    edit: EditDiscountCodePage,
  },

];
