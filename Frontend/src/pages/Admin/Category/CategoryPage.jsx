import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@utils/http";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import Image from "@components/Client/Image/Image.jsx"

const CategoryPage = () => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categoriesData, setCategoriesData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const getCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/categories");
      setCategoriesData(res?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
      console.log(error);
    }
  };
  useEffect(() => {
    getCategories();
  }, []);
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await api.delete(`/admin/categories/${deleteId}`);

      if (response.status === 200) {
        setOpenDeleteDialog(false);
        setDeleteId(null);

        if (categoriesData?.data) {
          const updatedCategories = categoriesData.data.filter((category) => {
            const removeCategory = (cat) => {
              if (cat.id === deleteId) return false;
              if (cat.children) {
                cat.children = cat.children.filter((child) =>
                  removeCategory(child)
                );
              }
              return true;
            };
            return removeCategory(category);
          });

          categoriesData.data = updatedCategories;
        }
        getCategories();

      }
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "Failed to delete category"
      );
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <div key={category.id}>
          <div className="flex items-center p-2 hover:bg-gray-50 border-b">
            {/* Image Column */}
            <div className="w-16 h-16 flex-shrink-0 mr-4">
              {category.image_url ? (
                <Image
                  url={`${
                    category.image_url
                  }`}
                  alt={category.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
            </div>

            {/* Category Name Column */}
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <IconButton
                    variant="text"
                    size="sm"
                    className={`p-1 hover:bg-blue-50 transition-colors ${
                      isExpanded ? "text-blue-500" : "text-blue-400"
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </IconButton>
                )}
                <span className="font-medium truncate" title={category.name}>
                  {category.name}
                </span>
              </div>
              <div
                className="text-sm text-gray-500 truncate"
                title={category.slug}
              >
                {category.slug}
              </div>
            </div>

            {/* Status Column */}
            <div className="w-24 flex-shrink-0 mr-4">
              <span
                className={`px-2 py-1 text-xs rounded ${
                  category.status === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {category.status === 1 ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Created By Column */}
            <div className="w-32 flex-shrink-0 mr-4">
              <div
                className="text-sm text-gray-600 truncate"
                title={category.created_by || "N/A"}
              > 
                {category.created_by || "N/A"}
              </div>
            </div>

            {/* Updated By Column */}
            <div className="w-32 flex-shrink-0 mr-4">
              <div
                className="text-sm text-gray-600 truncate"
                title={category.updated_by || "N/A"}
              >
                {category.updated_by || "N/A"}
              </div>
            </div>

            {/* Actions Column */}
            <div className="w-20 flex-shrink-0 flex items-center justify-end gap-2">
              <Tooltip content="Edit Category">
                <IconButton
                  variant="text"
                  color="amber"
                  onClick={() =>
                    navigate(`/admin/categories/${category.id}/edit`)
                  }
                >
                  <PencilIcon className="h-4 w-4" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Delete Category">
                <IconButton
                  variant="text"
                  color="red"
                  onClick={() => {
                    setDeleteId(category.id);
                    setOpenDeleteDialog(true);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="pl-8 transition-all duration-200 ease-in-out">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="black">
              Categories
            </Typography>
            <Button
              variant="gradient"
              color="green"
              className="flex items-center gap-2"
              onClick={() => navigate("/admin/categories/new")}
            >
              <PlusIcon className="h-4 w-4" color="black" />{" "}
              <span className="text-black">Add Category</span>
            </Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* Table Header */}
          <div className="flex items-center p-4 bg-gray-50 border-b">
            <div className="w-16 flex-shrink-0 mr-4 font-semibold">Image</div>
            <div className="flex-1 min-w-0 mr-4 font-semibold">
              Category Name
            </div>
            <div className="w-24 flex-shrink-0 mr-4 font-semibold">Status</div>
            <div className="w-32 flex-shrink-0 mr-4 font-semibold">
              Created By
            </div>
            <div className="w-32 flex-shrink-0 mr-4 font-semibold">
              Updated By
            </div>
            <div className="w-20 flex-shrink-0 font-semibold text-right">
              Actions
            </div>
          </div>

          {/* Table Body */}
          {categoriesData?.data && renderCategoryTree(categoriesData.data)}
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <div className="">
        <Dialog
          open={openDeleteDialog}
          handler={() => setOpenDeleteDialog(false)}
          className="flex items-center justify-center"
          animate={{
            mount: { scale: 1, y: 0, opacity: 1 },
            unmount: { scale: 0.9, y: -100, opacity: 0 },
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden">
            <DialogHeader className="justify-between py-4 px-6 bg-gradient-to-r from-red-500 to-red-600">
              <Typography
                variant="h6"
                color="white"
                className="text-center w-full font-semibold"
              >
                Delete Category
              </Typography>
              <IconButton
                color="white"
                size="sm"
                variant="text"
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setDeleteError(null);
                }}
                className="absolute right-4 top-4 hover:bg-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </DialogHeader>
            <DialogBody className="px-6 py-6">
              {deleteError ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {deleteError}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="bg-red-100 p-4 rounded-full ring-4 ring-red-50">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <Typography
                      variant="h6"
                      color="blue-gray"
                      className="font-semibold mb-2"
                    >
                      Are you sure?
                    </Typography>
                    <Typography
                      variant="small"
                      color="gray"
                      className="font-normal max-w-[240px]"
                    >
                      This action cannot be undone. This will permanently delete
                      the category and all its subcategories.
                    </Typography>
                  </div>
                </div>
              )}
            </DialogBody>
            <DialogFooter className="px-6 py-4 border-t border-gray-100">
              <div className="flex justify-end gap-3 w-full">
                <Button
                  variant="outlined"
                  color="blue-gray"
                  onClick={() => {
                    setOpenDeleteDialog(false);
                    setDeleteError(null);
                  }}
                  className="text-sm font-medium"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  color="red"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon color="black" className="h-4 w-4" />
                      <span className="text-black">Delete</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default CategoryPage;
