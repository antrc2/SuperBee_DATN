import {
  CategoryPage,
  CreateCategoryPage,
  EditCategoryPage,
  DiscountCodePage,
  CreateDiscountCodePage,
  EditDiscountCodePage,
  DonatePromotionPage,
  CreateDonatePromotionPage,
  EditDonatePromotionPage
} from "@pages";

export const adminModules = [
  {
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage
  },

  {
    name: "discount-codes",
    list: DiscountCodePage,
    create: CreateDiscountCodePage,
    edit: EditDiscountCodePage
  },

  {
    name: "donate-promotions",
    list: DonatePromotionPage,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage
  }
];
