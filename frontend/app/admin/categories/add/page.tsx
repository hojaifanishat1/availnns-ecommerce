"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { createCategory, getAdminCategories } from "@/services/category.service";
import { uploadAvatar } from "@/services/upload.service";
import { Category } from "@/types/category";

export default function AddCategoryPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    image: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const data = await getAdminCategories(token);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setFetching(false);
      }
    };

    loadCategories();
  }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadMessage({ type: "error", text: "Please upload an image file." });
      return;
    }

    try {
      setUploadingImage(true);
      setUploadMessage(null);
      const url = await uploadAvatar(file);
      setFormData((prev) => ({ ...prev, image: url }));
      setUploadMessage({ type: "success", text: "Image uploaded successfully." });
    } catch (err) {
      setUploadMessage({ type: "error", text: "Image upload failed. Please try again." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      // ব্যাকএন্ডের কম্প্যাটিবিলিটির জন্য image এবং img দুটোই পাঠানো হচ্ছে
      const payload = {
        ...formData,
        parent: formData.parent || undefined,
        image: formData.image,
        img: formData.image,
      };

      await createCategory(payload, token);

      router.push("/admin/categories");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Add New Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {error && <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Category Name</label>
          <input
            type="text"
            placeholder="e.g. Electronics"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Parent Category</label>
          {fetching ? (
            <div className="text-sm text-gray-500">Loading categories...</div>
          ) : (
            <select
              value={formData.parent}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-3 outline-none transition-all focus:ring-2 focus:ring-black"
            >
              <option value="">No parent (Top level)</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Category Image</label>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium focus:ring-2 focus:ring-black"
              />
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </div>
              )}
            </div>

            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all focus:ring-2 focus:ring-black"
            />

            {uploadMessage && (
              <p className={`text-sm ${uploadMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {uploadMessage.text}
              </p>
            )}

            {formData.image && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Preview</p>
                <img src={formData.image} alt="Category preview" className="h-24 w-full rounded-lg object-cover" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            placeholder="Enter category details..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Creating...
            </>
          ) : (
            "Create Category"
          )}
        </button>
      </form>
    </div>
  );
}
