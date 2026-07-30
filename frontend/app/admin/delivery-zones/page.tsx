"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Trash2, Edit3, X, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "@/services/deliveryZone.service";

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [districtsList, setDistrictsList] = useState<string[]>([
    "Dhaka",
    "Kishoreganj",
    "Gazipur",
    "Narayanganj",
    "Chittagong",
    "Sylhet",
    "Rajshahi",
    "Khulna",
    "Barisal",
    "Rangpur",
    "Mymensingh",
  ]);

  const [regularZonesList, setRegularZonesList] = useState<string[]>([
    "Inside Dhaka",
    "Outside Dhaka",
    "Whole Country",
  ]);

  const [regularThanasData, setRegularThanasData] = useState<Record<string, string[]>>({
    "Inside Dhaka": ["Gulshan", "Banani", "Uttara", "Dhanmondi", "Mirpur", "Tejgaon", "Motijheel"],
    "Outside Dhaka": ["Gazipur Sadar", "Savar", "Narayanganj Sadar", "Keraniganj", "Tongi"],
    "Whole Country": ["All Districts"],
  });

  const [kishoreganjThanas, setKishoreganjThanas] = useState<string[]>([
    "Kishoreganj Sadar",
    "Hossainpur",
    "Pakundia",
    "Katiadi",
    "Karimganj",
    "Tarail",
    "Itna",
    "Mithamain",
    "Austagram",
    "Nikli",
    "Bajitpur",
    "Kuliarchar",
    "Bhairab",
  ]);

  const [expressAreasList, setExpressAreasList] = useState<string[]>([
    "Town Hall",
    "Rema",
    "Baghbati",
    "Old Stadium Road",
  ]);

  const [form, setForm] = useState({
    zoneCategory: "Regular",              
    
    regularZoneSelect: "Inside Dhaka",     
    isNewRegularZone: false,              
    newRegularZoneName: "",               

    district: "Dhaka",                   
    isNewDistrict: false,                 
    newDistrictName: "",                  
    
    regularThana: "",                     
    isNewRegularThana: false,             
    newRegularThanaName: "",              

    kishoreganjThana: "Kishoreganj Sadar", 
    isNewThana: false,                    
    newThanaName: "",                     

    expressArea: "Town Hall",                      
    isNewExpressArea: false,
    newExpressAreaName: "",

    expressSubArea: "",                   
    deliveryFee: 60,
    expressFee: 100, // ডিফল্ট এক্সপ্রেস ফি আপডেট করা হলো 
    freeDeliveryAbove: 0, 
    estimatedDays: "2-3 Days",
    active: true,
  });

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await getDeliveryZones();
      setZones(data);
    } catch (error) {
      toast.error("Failed to load delivery zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleDeleteDistrict = (e: React.MouseEvent, dist: string) => {
    e.stopPropagation();
    if (districtsList.length <= 1) {
      toast.error("At least one district is required");
      return;
    }
    setDistrictsList(districtsList.filter((d) => d !== dist));
    if (form.district === dist) {
      const remaining = districtsList.filter((d) => d !== dist);
      setForm({ ...form, district: remaining[0] || "" });
    }
    toast.success(`District '${dist}' removed from dropdown`);
  };

  const handleDeleteRegularZone = (e: React.MouseEvent, zone: string) => {
    e.stopPropagation();
    if (regularZonesList.length <= 1) {
      toast.error("At least one regular zone is required");
      return;
    }
    const updatedZones = regularZonesList.filter((z) => z !== zone);
    setRegularZonesList(updatedZones);
    const updatedThanasData = { ...regularThanasData };
    delete updatedThanasData[zone];
    setRegularThanasData(updatedThanasData);

    if (form.regularZoneSelect === zone) {
      setForm({ ...form, regularZoneSelect: updatedZones[0] || "", regularThana: "" });
    }
    toast.success(`Zone '${zone}' removed from dropdown`);
  };

  const handleDeleteRegularThana = (e: React.MouseEvent, thana: string) => {
    e.stopPropagation();
    const currentZone = form.regularZoneSelect;
    const currentThanas = regularThanasData[currentZone] || [];
    const updatedThanas = currentThanas.filter((t) => t !== thana);
    
    setRegularThanasData({
      ...regularThanasData,
      [currentZone]: updatedThanas,
    });

    if (form.regularThana === thana) {
      setForm({ ...form, regularThana: "" });
    }
    toast.success(`Thana '${thana}' removed from dropdown`);
  };

  const handleDeleteExpressThana = (e: React.MouseEvent, thana: string) => {
    e.stopPropagation();
    if (kishoreganjThanas.length <= 1) {
      toast.error("At least one thana is required");
      return;
    }
    const updated = kishoreganjThanas.filter((t) => t !== thana);
    setKishoreganjThanas(updated);
    if (form.kishoreganjThana === thana) {
      setForm({ ...form, kishoreganjThana: updated[0] || "" });
    }
    toast.success(`Thana '${thana}' removed from dropdown`);
  };

  const handleDeleteExpressArea = (e: React.MouseEvent, area: string) => {
    e.stopPropagation();
    if (expressAreasList.length <= 1) {
      toast.error("At least one area is required");
      return;
    }
    const updated = expressAreasList.filter((a) => a !== area);
    setExpressAreasList(updated);
    if (form.expressArea === area) {
      setForm({ ...form, expressArea: updated[0] || "" });
    }
    toast.success(`Area '${area}' removed from dropdown`);
  };

  const handleSubmit = async () => {
    try {
      let finalZoneName = "";
      const finalDistrict = form.isNewDistrict ? form.newDistrictName.trim() : form.district;

      if (!finalDistrict) {
        toast.error("District name is required");
        return;
      }

      if (form.isNewDistrict && form.newDistrictName.trim()) {
        if (!districtsList.includes(form.newDistrictName.trim())) {
          setDistrictsList([...districtsList, form.newDistrictName.trim()]);
        }
      }

      if (form.zoneCategory === "Regular") {
        const zoneName = form.isNewRegularZone ? form.newRegularZoneName.trim() : form.regularZoneSelect;
        if (!zoneName) {
          toast.error("Regular zone name is required");
          return;
        }

        if (form.isNewRegularZone && form.newRegularZoneName.trim()) {
          if (!regularZonesList.includes(form.newRegularZoneName.trim())) {
            setRegularZonesList([...regularZonesList, form.newRegularZoneName.trim()]);
            setRegularThanasData({ ...regularThanasData, [form.newRegularZoneName.trim()]: [] });
          }
        }

        const finalRegThana = form.isNewRegularThana ? form.newRegularThanaName.trim() : form.regularThana;

        if (form.isNewRegularThana && finalRegThana && !form.isNewRegularZone) {
          const currentThanas = regularThanasData[zoneName] || [];
          if (!currentThanas.includes(finalRegThana)) {
            setRegularThanasData({
              ...regularThanasData,
              [zoneName]: [...currentThanas, finalRegThana],
            });
          }
        }

        finalZoneName = finalRegThana 
          ? `[${finalDistrict}] ${finalRegThana}, ${zoneName} (Regular)` 
          : `[${finalDistrict}] ${zoneName} (Regular)`;
      } else {
        const finalThana = form.isNewThana ? form.newThanaName.trim() : form.kishoreganjThana;
        if (!finalThana) {
          toast.error("Thana name is required");
          return;
        }

        if (form.isNewThana && form.newThanaName.trim()) {
          if (!kishoreganjThanas.includes(form.newThanaName.trim())) {
            setKishoreganjThanas([...kishoreganjThanas, form.newThanaName.trim()]);
          }
        }

        const finalExpArea = form.isNewExpressArea ? form.newExpressAreaName.trim() : form.expressArea;
        const subAreaVal = form.expressSubArea.trim() || finalExpArea;

        if (form.isNewExpressArea && form.newExpressAreaName.trim()) {
          if (!expressAreasList.includes(form.newExpressAreaName.trim())) {
            setExpressAreasList([...expressAreasList, form.newExpressAreaName.trim()]);
          }
        }

        // চেকআউট পেজের ম্যাপিংয়ের সাথে মিল রাখার জন্য ঠিকমতো [3 Hours] ফরম্যাট করা হলো
        finalZoneName = `[${finalDistrict}] ${finalThana} - ${finalExpArea} (${subAreaVal}) [3 Hours]`;
      }

      const calculatedExpressFee = form.zoneCategory === "3 Hours" ? Number(form.expressFee) || 0 : 0;

      const payload = {
        name: finalZoneName,
        deliveryFee: Number(form.deliveryFee) || 0,
        expressFee: calculatedExpressFee,
        expressDeliveryFee: calculatedExpressFee, 
        freeDeliveryAbove: Number(form.freeDeliveryAbove) || 0,
        estimatedDays: form.zoneCategory === "3 Hours" ? "Within 3 Hours" : form.estimatedDays,
        active: form.active,
      };

      setSubmitting(true);
      const token = localStorage.getItem("token") || "";

      if (editingId) {
        await updateDeliveryZone(editingId, payload, token);
        toast.success("Delivery zone updated successfully!");
        setEditingId(null);
      } else {
        await createDeliveryZone(payload, token);
        toast.success("New delivery zone created successfully!");
      }

      setForm({
        zoneCategory: "Regular",
        regularZoneSelect: "Inside Dhaka",
        isNewRegularZone: false,
        newRegularZoneName: "",
        district: "Dhaka",
        isNewDistrict: false,
        newDistrictName: "",
        regularThana: "",
        isNewRegularThana: false,
        newRegularThanaName: "",
        kishoreganjThana: "Kishoreganj Sadar",
        isNewThana: false,
        newThanaName: "",
        expressArea: "Town Hall",
        isNewExpressArea: false,
        newExpressAreaName: "",
        expressSubArea: "",
        deliveryFee: 60,
        expressFee: 100,
        freeDeliveryAbove: 0,
        estimatedDays: "2-3 Days",
        active: true,
      });

      loadZones();
    } catch (error: any) {
      console.error("Submit Error:", error);
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (zone: any) => {
    setEditingId(zone._id);
    const isExpress = zone.name.includes("3 Hours") || zone.name.includes("[3 Hours]");
    const resolvedExpressFee = zone.expressFee ?? zone.expressDeliveryFee ?? zone.charge ?? 100;

    setForm({
      zoneCategory: isExpress ? "3 Hours" : "Regular",
      regularZoneSelect: "Inside Dhaka",
      isNewRegularZone: false,
      newRegularZoneName: "",
      district: isExpress ? "Kishoreganj" : "Dhaka",
      isNewDistrict: false,
      newDistrictName: "",
      regularThana: "",
      isNewRegularThana: false,
      newRegularThanaName: "",
      kishoreganjThana: "Kishoreganj Sadar",
      isNewThana: false,
      newThanaName: "",
      expressArea: "Town Hall",
      isNewExpressArea: false,
      newExpressAreaName: "",
      expressSubArea: "",
      deliveryFee: zone.deliveryFee || 60,
      expressFee: resolvedExpressFee,
      freeDeliveryAbove: zone.freeDeliveryAbove || zone.minOrderAmount || 0,
      estimatedDays: zone.estimatedDays || "2-3 Days",
      active: zone.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      zoneCategory: "Regular",
      regularZoneSelect: "Inside Dhaka",
      isNewRegularZone: false,
      newRegularZoneName: "",
      district: "Dhaka",
      isNewDistrict: false,
      newDistrictName: "",
      regularThana: "",
      isNewRegularThana: false,
      newRegularThanaName: "",
      kishoreganjThana: "Kishoreganj Sadar",
      isNewThana: false,
      newThanaName: "",
      expressArea: "Town Hall",
      isNewExpressArea: false,
      newExpressAreaName: "",
      expressSubArea: "",
      deliveryFee: 60,
      expressFee: 100,
      freeDeliveryAbove: 0,
      estimatedDays: "2-3 Days",
      active: true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;

    try {
      const token = localStorage.getItem("token") || "";
      await deleteDeliveryZone(id, token);
      toast.success("Delivery zone deleted successfully");
      loadZones();
    } catch (error) {
      toast.error("Failed to delete zone");
    }
  };

  const filteredZones = zones.filter((zone) =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentThanas = regularThanasData[form.regularZoneSelect] || [];

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <Truck size={32} className="text-black" />
            Delivery Zones
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Manage regular and 3 hours express delivery zones, fees and minimum order conditions for free delivery
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-black transition shadow-sm"
          />
        </div>
      </div>

      {/* Create / Edit Form Card */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">
            {editingId ? "Edit Delivery Zone" : "Add New Delivery Zone"}
          </h2>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition"
            >
              <X size={14} /> Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* 1. Delivery Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Delivery Type</label>
            <select
              value={form.zoneCategory}
              onChange={(e) => setForm({ ...form, zoneCategory: e.target.value })}
              className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition cursor-pointer"
            >
              <option value="Regular">Regular Delivery</option>
              <option value="3 Hours">3 Hours Express</option>
            </select>
          </div>

          {form.zoneCategory === "Regular" ? (
            <>
              {/* 2. Regular Zone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Regular Zone</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isNewRegularZone: !form.isNewRegularZone, regularThana: "", isNewRegularThana: false, newRegularThanaName: "" })}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {form.isNewRegularZone ? "Select Existing" : "+ Add New Zone"}
                  </button>
                </div>

                {form.isNewRegularZone ? (
                  <input
                    value={form.newRegularZoneName}
                    onChange={(e) => setForm({ ...form, newRegularZoneName: e.target.value })}
                    placeholder="Enter new zone name..."
                    className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={form.regularZoneSelect}
                      onChange={(e) => setForm({ ...form, regularZoneSelect: e.target.value, regularThana: "", isNewRegularThana: false })}
                      className="w-full rounded-2xl border bg-gray-50/50 p-3.5 pr-10 text-sm outline-none focus:bg-white focus:border-black transition cursor-pointer"
                    >
                      {regularZonesList.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                    {form.regularZoneSelect && regularZonesList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRegularZone(e, form.regularZoneSelect)}
                        title="Delete current zone from list"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 3. District */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">District (জেলা)</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isNewDistrict: !form.isNewDistrict })}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {form.isNewDistrict ? "Select Existing" : "+ Add New District"}
                  </button>
                </div>

                {form.isNewDistrict ? (
                  <input
                    value={form.newDistrictName}
                    onChange={(e) => setForm({ ...form, newDistrictName: e.target.value })}
                    placeholder="Enter new district name..."
                    className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full rounded-2xl border bg-gray-50/50 p-3.5 pr-10 text-sm outline-none focus:bg-white focus:border-black transition cursor-pointer"
                    >
                      {districtsList.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                    {form.district && districtsList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDistrict(e, form.district)}
                        title="Delete current district from list"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Regular Thana */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Zone Thana (Optional)</label>
                  {!form.isNewRegularZone && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isNewRegularThana: !form.isNewRegularThana, regularThana: "" })}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {form.isNewRegularThana ? "Select Existing" : "+ Add New Thana"}
                    </button>
                  )}
                </div>

                {form.isNewRegularZone ? (
                  <input
                    disabled
                    placeholder="Disabled for new zone"
                    className="w-full rounded-2xl border bg-gray-100 p-3.5 text-sm outline-none opacity-50 cursor-not-allowed"
                  />
                ) : form.isNewRegularThana ? (
                  <input
                    value={form.newRegularThanaName}
                    onChange={(e) => setForm({ ...form, newRegularThanaName: e.target.value })}
                    placeholder="Enter new thana name..."
                    className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={form.regularThana}
                      onChange={(e) => setForm({ ...form, regularThana: e.target.value })}
                      className="w-full rounded-2xl border bg-gray-50/50 p-3.5 pr-10 text-sm outline-none focus:bg-white focus:border-black transition cursor-pointer"
                    >
                      <option value="">-- All Thanas in Zone --</option>
                      {currentThanas.map((thana) => (
                        <option key={thana} value={thana}>
                          {thana}
                        </option>
                      ))}
                    </select>
                    {form.regularThana && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRegularThana(e, form.regularThana)}
                        title="Delete current thana from list"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Express Thana */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Thana / Upazila</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isNewThana: !form.isNewThana })}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {form.isNewThana ? "Select Existing" : "+ Add New Thana"}
                  </button>
                </div>

                {form.isNewThana ? (
                  <input
                    value={form.newThanaName}
                    onChange={(e) => setForm({ ...form, newThanaName: e.target.value })}
                    placeholder="Enter new thana name..."
                    className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={form.kishoreganjThana}
                      onChange={(e) => setForm({ ...form, kishoreganjThana: e.target.value })}
                      className="w-full rounded-2xl border bg-gray-50/50 p-3.5 pr-10 text-sm outline-none focus:bg-white focus:border-black transition cursor-pointer"
                    >
                      {kishoreganjThanas.map((thana) => (
                        <option key={thana} value={thana}>
                          {thana}
                        </option>
                      ))}
                    </select>
                    {form.kishoreganjThana && kishoreganjThanas.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteExpressThana(e, form.kishoreganjThana)}
                        title="Delete current thana from list"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Express Area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Express Area</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isNewExpressArea: !form.isNewExpressArea })}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {form.isNewExpressArea ? "Select Existing" : "+ Add New Area"}
                  </button>
                </div>

                {form.isNewExpressArea ? (
                  <input
                    value={form.newExpressAreaName}
                    onChange={(e) => setForm({ ...form, newExpressAreaName: e.target.value })}
                    placeholder="Enter new area name..."
                    className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={form.expressArea}
                      onChange={(e) => setForm({ ...form, expressArea: e.target.value })}
                      className="w-full rounded-2xl border bg-gray-50/50 p-3.5 pr-10 text-sm outline-none focus:bg-white focus:border-black transition cursor-pointer"
                    >
                      {expressAreasList.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    {form.expressArea && expressAreasList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteExpressArea(e, form.expressArea)}
                        title="Delete current area from list"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Express Sub-Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Sub-Area / Landmark</label>
                <input
                  value={form.expressSubArea}
                  onChange={(e) => setForm({ ...form, expressSubArea: e.target.value })}
                  placeholder="e.g. Old Stadium Road"
                  className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Regular Delivery Fee (৳)</label>
            <input
              type="number"
              value={form.deliveryFee}
              onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
              placeholder="60"
              className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
            />
          </div>

          {/* Express Charge Field */}
          {form.zoneCategory === "3 Hours" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Fixed Express Charge (৳)</label>
              <input
                type="number"
                value={form.expressFee}
                onChange={(e) => setForm({ ...form, expressFee: Number(e.target.value) })}
                placeholder="100"
                className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
              />
            </div>
          )}

          {/* Free Delivery Above Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Free Delivery Min Order (৳)</label>
            <input
              type="number"
              value={form.freeDeliveryAbove}
              onChange={(e) => setForm({ ...form, freeDeliveryAbove: Number(e.target.value) })}
              placeholder="0 (0 = disabled)"
              className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">If order amount $\ge$ this, delivery will be FREE.</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Estimated Time (ETA)</label>
            <input
              value={form.zoneCategory === "3 Hours" ? "Within 3 Hours" : form.estimatedDays}
              onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
              placeholder="2-3 Days"
              disabled={form.zoneCategory === "3 Hours"}
              className="w-full rounded-2xl border bg-gray-50/50 p-3.5 text-sm outline-none focus:bg-white focus:border-black transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Active Status Checkbox */}
        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="activeStatus"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="w-5 h-5 accent-black rounded cursor-pointer"
          />
          <label htmlFor="activeStatus" className="text-sm font-semibold cursor-pointer select-none">
            Active Zone (Available for checkout)
          </label>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-2xl bg-black px-7 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 active:scale-[0.98] transition disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : editingId ? (
              <Edit3 size={18} />
            ) : (
              <Plus size={18} />
            )}
            {submitting ? "Saving..." : editingId ? "Update Zone" : "Add Zone"}
          </button>
          
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="rounded-2xl border px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/70 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 sm:p-5">Zone Name</th>
                <th className="p-4 sm:p-5">Delivery Fee</th>
                <th className="p-4 sm:p-5">Express Fee</th>
                <th className="p-4 sm:p-5">Free Delivery Threshold</th>
                <th className="p-4 sm:p-5">ETA</th>
                <th className="p-4 sm:p-5">Status</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-black" />
                      <span>Loading delivery zones...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    No delivery zones found
                  </td>
                </tr>
              ) : (
                filteredZones.map((zone) => {
                  const isExpress = zone.name.includes("3 Hours") || zone.name.includes("[3 Hours]");
                  const freeThreshold = zone.freeDeliveryAbove || zone.minOrderAmount || 0;
                  const displayExpressFee = zone.expressFee ?? zone.expressDeliveryFee ?? zone.charge ?? 100;

                  return (
                    <tr key={zone._id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 sm:p-5 font-bold">
                        {zone.name}
                        {isExpress ? (
                          <span className="ml-2.5 rounded-lg bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                            3 Hours Express
                          </span>
                        ) : (
                          <span className="ml-2.5 rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 font-medium">৳{zone.deliveryFee}</td>
                      <td className="p-4 sm:p-5 font-medium">
                        {isExpress ? (
                          <span className="text-purple-600 font-bold">৳{displayExpressFee}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 font-medium">
                        {freeThreshold > 0 ? (
                          <span className="text-emerald-600 font-bold">Free if order $\ge$ ৳{freeThreshold}</span>
                        ) : (
                          <span className="text-gray-400">Not Set</span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 text-gray-600">{zone.estimatedDays}</td>
                      <td className="p-4 sm:p-5">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                            zone.active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {zone.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(zone)}
                            className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition shadow-xs"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(zone._id)}
                            className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
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
