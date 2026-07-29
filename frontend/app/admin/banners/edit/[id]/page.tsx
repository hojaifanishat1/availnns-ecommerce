"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminBanners, updateBanner } from "@/services/banner.service";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Uploader from "@/components/admin/Uploader"; // Uploader কম্পোনেন্ট ইমপোর্ট করা হলো

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const banners = await getAdminBanners(token);
        const currentBanner = banners.find((b: any) => b._id === id);

        if (currentBanner) {
          setFormData({
            title: currentBanner.title || "",
            subtitle: currentBanner.subtitle || "",
            image: currentBanner.image || "",
            link: currentBanner.link || "",
            isActive: currentBanner.isActive ?? true,
          });
        }
      } catch (err) {
        console.error("Error fetching banner:", err);
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchBannerData();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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

      const res = await updateBanner(id, formData, token);
      if (res.success) {
        alert("Banner updated successfully!");
        router.push("/admin/banners");
      } else {
        alert(res.message || "Failed to update banner");
      }
    } catch (err) {
      console.error("Error updating banner:", err);
      alert("An error occurred while updating the banner.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Banner</h1>
          <p className="text-gray-500">Update promotional banner details.</p>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        {/* Banner Image Uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image *</label>
          <Uploader
            value={formData.image}
            onChange={(url: string) => setFormData({ ...formData, image: url })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Link (Optional)</label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active Status (Show on Home Page)
          </label>
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
            Update Banner
          </button>
        </div>
      </form>
    </div>
  );
}
