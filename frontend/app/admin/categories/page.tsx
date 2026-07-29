"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, FolderTree, Loader2, AlertCircle } from "lucide-react";
import { getAdminCategories, removeCategory } from "@/services/category.service";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // কোন কোন মেইন ক্যাটেগরির ড্রপডাউন ওপেন আছে তা ট্র্যাক করার জন্য স্টেট
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");

      const data = await getAdminCategories(token);
      setCategories(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await removeCategory(id, token);
      setCategories((prev) => prev.filter((cat) => cat._id !== id && cat.parent?._id !== id && cat.parent !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete category.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // মেইন ক্যাটেগরি এবং সাব-ক্যাটেগরি আলাদা করা
  const mainCategories = categories.filter((cat) => !cat.parent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage and organize your product catalog.</p>
        </div>

        <Link
          href="/admin/categories/add"
          className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer"
        >
          <Plus size={20} />
          Add Category
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mainCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                mainCategories.map((mainCat) => {
                  const mainImage = mainCat.image || mainCat.img;
                  const subCategories = categories.filter(
                    (sub) => sub.parent === mainCat._id || sub.parent?._id === mainCat._id
                  );
                  const isExpanded = expanded[mainCat._id];

                  return (
                    <React.Fragment key={mainCat._id}>
                      {/* Main Category Row */}
                      <tr className="hover:bg-gray-50/50 transition-colors bg-white">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {/* ইমেজ বা নাম বা পুরো লেফট সেকশনে ক্লিক করলে টগল হবে (যদি সাব-ক্যাটেগরি থাকে) */}
                          <div 
                            onClick={() => subCategories.length > 0 && toggleExpand(mainCat._id)}
                            className={`flex items-center gap-3 ${subCategories.length > 0 ? "cursor-pointer select-none" : ""}`}
                          >
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={mainCat.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 hover:opacity-90 transition-opacity"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 hover:bg-gray-200 transition-colors">
                                <FolderTree size={18} />
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{mainCat.name}</span>
                              {subCategories.length > 0 && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {subCategories.length} subs
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          {mainCat.description || <span className="italic text-gray-400">No description</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <Link
                              href={`/admin/categories/edit/${mainCat._id}`}
                              className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(mainCat._id)}
                              className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub Categories Rows with Smooth Expand Animation */}
                      {subCategories.length > 0 && (
                        <tr>
                          <td colSpan={3} className="p-0 border-0">
                            <div
                              className={`grid transition-all duration-300 ease-in-out ${
                                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                              }`}
                            >
                              <div className="overflow-hidden bg-gray-50/70 divide-y divide-gray-200/60">
                                {subCategories.map((subCat) => {
                                  const subImage = subCat.image || subCat.img;
                                  return (
                                    <div
                                      key={subCat._id}
                                      className="flex items-center justify-between px-6 py-3 pl-16 hover:bg-gray-100/60 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 w-1/3">
                                        {subImage ? (
                                          <img
                                            src={subImage}
                                            alt={subCat.name}
                                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                            <FolderTree size={14} />
                                          </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-700 truncate">{subCat.name}</span>
                                      </div>
                                      <div className="w-1/3 text-gray-500 text-xs truncate px-4">
                                        {subCat.description || <span className="italic text-gray-400">No description</span>}
                                      </div>
                                      <div className="w-1/3 flex justify-center gap-2">
                                        <Link
                                          href={`/admin/categories/edit/${subCat._id}`}
                                          className="p-1.5 rounded-md bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                        >
                                          <Edit size={14} />
                                        </Link>
                                        <button
                                          onClick={() => handleDelete(subCat._id)}
                                          className="p-1.5 rounded-md bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
