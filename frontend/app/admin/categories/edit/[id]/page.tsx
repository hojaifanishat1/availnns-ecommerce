"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { getAdminCategories, updateCategory } from "@/services/category.service";
import { uploadAvatar } from "@/services/upload.service";
import { Category } from "@/types/category";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({ name: "", description: "", parent: "", image: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const data = await getAdminCategories(token);
        const category = data.find((item: any) => item._id === id);

        if (category) {
          setForm({
            name: category.name,
            description: category.description || "",
            parent: category.parent?._id || category.parent || "",
            image: category.image || category.img || "",
          });
        }
        setCategories(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

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
      setForm((prev) => ({ ...prev, image: url }));
      setUploadMessage({ type: "success", text: "Image uploaded successfully." });
    } catch (err) {
      setUploadMessage({ type: "error", text: "Image upload failed. Please try again." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const payload = {
        ...form,
        parent: form.parent || null,
        image: form.image,
        img: form.image,
      };

      await updateCategory(id, payload, token);
      router.push("/admin/categories");
    } catch (err: any) {
      setError("Failed to update category. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {error && <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Category Name</label>
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Parent Category</label>
          <select
            name="parent"
            value={form.parent}
            onChange={(e) => setForm({ ...form, parent: e.target.value })}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-3 outline-none transition-all focus:ring-2 focus:ring-black"
          >
            <option value="">No parent (Top level)</option>
            {categories
              .filter((cat) => cat._id !== id)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
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
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all focus:ring-2 focus:ring-black"
            />

            {uploadMessage && (
              <p className={`text-sm ${uploadMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {uploadMessage.text}
              </p>
            )}

            {form.image && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Preview</p>
                <img src={form.image} alt="Category preview" className="h-24 w-full rounded-lg object-cover" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition-all focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Updating...
            </>
          ) : (
            "Update Category"
          )}
        </button>
      </form>
    </div>
  );
}
