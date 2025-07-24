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
import { useNotification } from "@contexts/NotificationContext";

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
  const notification = useNotification();

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
        notification.pop("Xóa danh mục thành công!", "s");

      }
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "Failed to delete category"
      );
      notification.pop(error.response?.data?.message || "Xóa danh mục thất bại!", "e");
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

      {/* Delete Confirmation Popup */}
      {openDeleteDialog && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenDeleteDialog(false);
              setDeleteError(null);
            }
          }}
        >
          <div className="bg-input rounded-lg shadow-themed w-full max-w-xs mx-auto flex flex-col items-center justify-center p-6 text-center relative">
            {/* Close (X) button */}
            <button
              className="absolute top-2 right-2 text-secondary hover:text-primary p-1 rounded-full focus:outline-none"
              onClick={() => {
                setOpenDeleteDialog(false);
                setDeleteError(null);
              }}
              aria-label="Đóng"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Icon */}
            <div className="mb-2">
              <div className="bg-gradient-danger p-2 rounded-full flex items-center justify-center mx-auto">
                <TrashIcon className="h-7 w-7 text-accent-contrast" />
              </div>
            </div>
            {/* Title & Description */}
            <div className="mb-3">
              <span className="block font-semibold text-primary text-base mb-1">Xác nhận xóa danh mục?</span>
              <span className="block text-xs text-secondary">Hành động này không thể hoàn tác.</span>
            </div>
            {/* Error message */}
            {deleteError && (
              <div className="alert alert-danger mb-2 text-xs">{deleteError}</div>
            )}
            {/* Action buttons */}
            <div className="flex gap-2 justify-center w-full mt-2">
              <Button
                variant="outlined"
                color="blue-gray"
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setDeleteError(null);
                }}
                className="text-xs font-medium px-4 py-1 min-w-[70px]"
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="gradient"
                color="red"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 text-xs text-primary font-medium px-4 py-1 min-w-[70px] shadow-themed hover:shadow-lg transition-all duration-200"
              >
                {isDeleting ? (
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
                ) : (
                  <TrashIcon color="black" className="h-4 w-4" />
                )}
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
