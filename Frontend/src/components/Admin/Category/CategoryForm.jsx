import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGet } from "@utils/hook";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
} from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CategoryForm({ initialData, onSave }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    status: "1", // Default to active
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: categoriesData } = useGet("/categories");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        parent_id: initialData.parent_id?.toString() || "",
        status: initialData.status?.toString() || "1",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (error) {
      setError(error.message || "Failed to save category");
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOptions = (categories, level = 0) => {
    return categories.map((category) => {
      if (initialData && category.id.toString() === initialData.id.toString()) {
        return null;
      }

      const dashes = level === 0 ? "--" : "----".repeat(level);
      return (
        <React.Fragment key={category.id}>
          <option value={category.id.toString()}>
            {dashes} {category.name}
          </option>
          {category.children && category.children.length > 0 && 
            renderCategoryOptions(category.children, level + 1)}
        </React.Fragment>
      );
    }).filter(Boolean);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="w-full max-w-[800px] mx-auto">
        <CardHeader 
          variant="gradient" 
          color={initialData ? "amber" : "green"} 
          className={`mb-8 p-6 relative ${initialData ? 'bg-amber-50' : 'bg-green-50'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IconButton
                variant="text"
                color={initialData ? "amber" : "green"}
                onClick={() => navigate("/admin/categories")}
                className={initialData ? "hover:bg-amber-100" : "hover:bg-green-100"}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </IconButton>
              <Typography 
                variant="h5" 
                color={initialData ? "amber" : "green"} 
                className="font-semibold"
              >
                {initialData ? "Edit Category" : "Create New Category"}
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                initialData ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
              }`}>
                {initialData ? 'Edit Mode' : 'Create Mode'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <Typography variant="small" color={initialData ? "amber" : "green"} className="mb-2 font-medium">
                  Category Name
                </Typography>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  required
                  label={null}
                  className="!text-base"
                  containerProps={{
                    className: "min-w-[100px]",
                  }}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Typography variant="small" color={initialData ? "amber" : "green"} className="mb-2 font-medium">
                  Parent Category
                </Typography>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className={`w-full rounded-lg border ${
                    initialData 
                      ? 'border-amber-200 focus:border-amber-500' 
                      : 'border-green-200 focus:border-green-500'
                  } bg-white px-3 py-2.5 text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50`}
                >
                  <option value="">None (Root Category)</option>
                  {categoriesData?.data && renderCategoryOptions(categoriesData.data)}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <Typography variant="small" color={initialData ? "amber" : "green"} className="mb-2 font-medium">
                  Status
                </Typography>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="status"
                        value="1"
                        checked={formData.status === "1"}
                        onChange={handleChange}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                      />
                      <div className="absolute inset-0 rounded-full bg-green-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-sm font-medium text-green-600 group-hover:text-green-700 transition-colors">
                      Active
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="status"
                        value="0"
                        checked={formData.status === "0"}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500"
                      />
                      <div className="absolute inset-0 rounded-full bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors">
                      Inactive
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outlined"
                color={initialData ? "amber" : "green"}
                onClick={() => navigate("/admin/categories")}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to List
              </Button>
              <Button
                type="submit"
                variant="filled"
                color={initialData ? "amber" : "green"}
                disabled={loading}
                className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 text-black"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    {initialData ? "Update Category" : "Create Category"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
