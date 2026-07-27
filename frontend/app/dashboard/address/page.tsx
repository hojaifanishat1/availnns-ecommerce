"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  Home,
  Briefcase,
  Phone,
  User,
  X,
} from "lucide-react";
import LocationPicker from "@/components/checkout/LocationPicker";
import api from "@/services/api";

interface Address {
  id: string;
  title: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  type: "home" | "work" | "other";
  location: {
    formattedAddress: string;
    division: string;
    district: string;
    area: string;
    road: string;
    latitude: string;
    longitude: string;
    googleMapLink: string;
  };
}

export default function AddressPage() {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialLocation = {
    formattedAddress: "",
    division: "",
    district: "",
    area: "",
    road: "",
    latitude: "",
    longitude: "",
    googleMapLink: "",
  };

  const [formData, setFormData] = useState<Omit<Address, "id" | "isDefault">>({
    title: "Home Address",
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "Bangladesh",
    type: "home",
    location: initialLocation,
  });

  // 1. Load Saved Addresses from LocalStorage & User Info from API
  useEffect(() => {
    const localData = localStorage.getItem("user_addresses");
    if (localData) {
      try {
        setAddresses(JSON.parse(localData));
      } catch (e) {
        console.error("Error parsing local addresses:", e);
      }
    }

    const loadUser = async () => {
      try {
        const userRes = await api.get("/users/me");
        if (userRes.data?.user) {
          setUser(userRes.data.user);
        }
      } catch (error) {
        console.log("User endpoint not found, using manual inputs.");
      }
    };
    loadUser();
  }, []);

  const saveToLocalStorage = (data: Address[]) => {
    setAddresses(data);
    localStorage.setItem("user_addresses", JSON.stringify(data));
  };

  // Open Modal & Auto-fill User's Saved Name and Phone (Read-Only)
  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        title: address.title,
        name: address.name,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        type: address.type,
        location: address.location || initialLocation,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "Home Address",
        name: user?.name || user?.fullName || "",
        phone: user?.phone || "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "Bangladesh",
        type: "home",
        location: initialLocation,
      });
    }
    setIsOpenModal(true);
  };

  const setLocation = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      location: data,
      street: data.formattedAddress || prev.street,
      city: data.district || prev.city,
      state: data.division || prev.state,
    }));
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveToLocalStorage(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const updated = addresses.filter((a) => a.id !== id);
      saveToLocalStorage(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location.latitude || !formData.location.longitude) {
      alert("Please select a location on the map.");
      return;
    }

    let updatedAddresses: Address[];

    if (editingId) {
      updatedAddresses = addresses.map((addr) =>
        addr.id === editingId ? { ...addr, ...formData } : addr
      );
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      updatedAddresses = [...addresses, newAddress];
    }

    saveToLocalStorage(updatedAddresses);
    setIsOpenModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans text-slate-900 antialiased p-4 sm:p-6">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition active:scale-95 shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Saved Addresses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your address and location for quick checkout.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition active:scale-95 shadow-sm shrink-0"
        >
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* 2. ADDRESS CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <MapPin className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-sm font-semibold text-slate-700">No saved addresses yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add New Address" to pick your location.</p>
          </div>
        ) : (
          addresses.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between relative shadow-2xs ${
                item.isDefault
                  ? "border-slate-900 ring-1 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                      {item.type === "home" ? (
                        <Home size={14} />
                      ) : item.type === "work" ? (
                        <Briefcase size={14} />
                      ) : (
                        <MapPin size={14} />
                      )}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {item.title}
                    </span>
                  </div>

                  {item.isDefault && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Default
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" /> {item.name}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Phone size={13} className="text-slate-400" /> {item.phone}
                  </p>
                  <p className="pt-1 leading-relaxed text-slate-700 font-normal">
                    {item.street || item.location?.formattedAddress}, {item.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                {!item.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(item.id)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Primary address
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Address"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Address"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. ADD/EDIT MODAL WITH LOCATION PICKER */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-8 p-6 shadow-2xl border border-slate-100 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Map Location *
                </label>
                <LocationPicker
                  location={formData.location}
                  setLocation={setLocation}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* NAME FIELD (READ-ONLY) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Full Name
                  </label>
                  <input
                    readOnly
                    value={formData.name}
                    placeholder="Full Name"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-100 outline-none cursor-not-allowed"
                  />
                </div>
                
                {/* PHONE NUMBER FIELD (READ-ONLY) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Phone Number
                  </label>
                  <input
                    readOnly
                    value={formData.phone}
                    placeholder="017XXXXXXXX"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 bg-slate-100 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Street Address / House / Road
                </label>
                <input
                  required
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="House 12, Road 5..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Address Tag
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "home", label: "Home", icon: Home },
                    { key: "work", label: "Work", icon: Briefcase },
                    { key: "other", label: "Other", icon: MapPin },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            type: t.key as any,
                            title: `${t.label} Address`,
                          })
                        }
                        className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                          formData.type === t.key
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Icon size={14} /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  {editingId ? "Update Address" : "Save Address"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
