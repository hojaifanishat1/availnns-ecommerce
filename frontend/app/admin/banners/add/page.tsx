"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBanner } from "@/services/banner.service";
import { Loader2, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized! Please login again.");
        return;
      }

      if (!imageFile) {
        alert("Please select a banner image file.");
        return;
      }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("link", formData.link);
      data.append("image", imageFile); // সরাসরি ফাইল অবজেক্ট পাঠানো হলো

      const res = await createBanner(data, token);
      if (res.success) {
        alert("Banner created successfully!");
        router.push("/admin/banners");
      } else {
        alert(res.message || "Failed to create banner");
      }
    } catch (err) {
      console.error("Error creating banner:", err);
      alert("An error occurred while creating the banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/banners"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Banner</h1>
          <p className="text-gray-500">Create a promotional banner for your home page.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Summer Sale 2026"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder="e.g. Up to 50% off on all items"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        {/* Banner Image File Uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image File *</label>
          {!preview ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition hover:bg-gray-50">
              <Upload size={24} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Click to upload image file</span>
              <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border bg-gray-100">
              <Image
                src={preview}
                alt="Banner Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreview("");
                }}
                className="absolute right-3 top-3 p-1.5 rounded-full bg-black text-white hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Link (Optional)</label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="e.g. /shop or /categories/electronics"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link
            href="/admin/banners"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Save Banner
          </button>
        </div>
      </form>
    </div>
  );
}
