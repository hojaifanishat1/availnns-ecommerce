"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  Loader2,
  Truck,
  Clock,
  MapPin,
  Zap,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react";
import api from "@/services/api";
import useCart from "@/hooks/useCart";
import {
  useCurrency,
} from "@/context/CurrencyContext";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import ShippingForm from "@/components/checkout/ShippingForm";
import LocationPicker from "@/components/checkout/LocationPicker";
import {
  getDeliveryZones,
} from "@/services/deliveryZone.service";

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    loading: cartLoading
  } = useCart();

  const {
    formatPrice
  } = useCurrency();

  const items = useMemo(
    () => cart?.items || [],
    [cart]
  );

  const [
    user,
    setUser
  ] = useState<any>(null);

  const [
    userLoading,
    setUserLoading
  ] = useState(true);

  const [
    zones,
    setZones
  ] = useState<any[]>([]);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isUsingSavedAddress, setIsUsingSavedAddress] = useState<boolean>(false);

  // জোন ও ডেলিভারি টাইপ স্টেট
  const [matchedRegularZone, setMatchedRegularZone] = useState<any>(null);
  const [matchedExpressZone, setMatchedExpressZone] = useState<any>(null);
  const [expressAvailable, setExpressAvailable] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<"regular" | "express">("regular");
  const [selectedZone, setSelectedZone] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    form,
    setForm
  ] = useState({
    name: "",
    phone: "",
    country: "Bangladesh",
    location: {
      formattedAddress: "",
      division: "",
      district: "",
      area: "",
      road: "",
      latitude: "",
      longitude: "",
      googleMapLink: "",
    }
  });

  // =====================
  // LOAD USER & SAVED ADDRESSES
  // =====================
  useEffect(() => {
    const loadUserAndAddresses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login?redirect=/checkout");
          return;
        }

        const res = await api.get("/users/me");
        setUser(res.data.user);

        // Load saved addresses from localStorage or user profile
        const localData = localStorage.getItem("user_addresses");
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSavedAddresses(parsed);
              const savedId = localStorage.getItem("selected_address_id");
              const defaultAddr = parsed.find((a) => a.id === savedId) || parsed.find((a) => a.isDefault) || parsed[0];
              if (defaultAddr) {
                handleSelectSavedAddress(defaultAddr, zones);
              }
            }
          } catch (e) {
            console.error("Error parsing saved addresses", e);
          }
        }
      } catch (error) {
        console.log("USER ERROR", error);
        router.replace("/login?redirect=/login");
      } finally {
        setUserLoading(false);
      }
    };

    loadUserAndAddresses();
  }, [router]);

  // =====================
  // LOAD DELIVERY ZONE
  // =====================
  useEffect(() => {
    const loadZones = async () => {
      try {
        const data = await getDeliveryZones();
        const activeZones = data.filter((z: any) => z.active);
        setZones(activeZones);
        if (!isUsingSavedAddress) {
          processZonesAndLocation(form.location, activeZones);
        }
      } catch (error) {
        console.log("ZONE ERROR", error);
      }
    };

    loadZones();
  }, []);

  // =====================
  // AUTO FILL USER
  // =====================
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // =====================
  // SELECT SAVED ADDRESS HANDLER
  // =====================
  const handleSelectSavedAddress = (addr: any, allZones = zones) => {
    setSelectedAddressId(addr.id);
    setIsUsingSavedAddress(true); // Mark that user chose a saved address
    localStorage.setItem("selected_address_id", addr.id);

    const updatedLocation = {
      formattedAddress: addr.street || addr.location?.formattedAddress || "",
      division: addr.division || "",
      district: addr.city || addr.district || "",
      area: addr.area || "",
      road: addr.road || "",
      latitude: addr.latitude || addr.location?.latitude || "saved_lat_dummy", // bypass map validation if saved
      longitude: addr.longitude || addr.location?.longitude || "saved_lng_dummy",
      googleMapLink: addr.googleMapLink || "",
    };

    setForm(prev => ({
      ...prev,
      name: addr.fullName || prev.name,
      phone: addr.phone || prev.phone,
      location: updatedLocation,
    }));

    processZonesAndLocation(updatedLocation, allZones);
  };

  // =====================
  // PROCESS ZONES BASED ON LOCATION
  // =====================
  const processZonesAndLocation = (loc: any, allZones: any[]) => {
    if (!allZones || allZones.length === 0) return;

    const district = (loc.district || "").toLowerCase();
    const area = (loc.area || loc.formattedAddress || "").toLowerCase();

    // 1. Regular Zone Matching
    const foundRegular = allZones.find((zone) => {
      const zName = zone.name.toLowerCase();
      const isExpress = zName.includes("3 hours") || zName.includes("[3 hours]");
      if (isExpress) return false;
      return zName.includes(district) || (area && zName.includes(area));
    });

    const finalRegular = foundRegular || allZones.find(z => !z.name.toLowerCase().includes("3 hours")) || allZones[0];
    setMatchedRegularZone(finalRegular);

    // 2. Express Zone Matching (3 hours)
    const foundExpress = allZones.find((zone) => {
      const zName = zone.name.toLowerCase();
      const isExpress = zName.includes("3 hours") || zName.includes("[3 hours]");
      if (!isExpress) return false;
      return zName.includes(district) || (area && zName.includes(area));
    });

    if (foundExpress) {
      setExpressAvailable(true);
      setMatchedExpressZone(foundExpress);
    } else {
      setExpressAvailable(false);
      setMatchedExpressZone(null);
      if (deliveryType === "express") {
        setDeliveryType("regular");
      }
    }

    // Default selected zone ID
    const activeSelectedZone = (deliveryType === "express" && foundExpress) ? foundExpress._id : finalRegular?._id;
    if (activeSelectedZone) {
      setSelectedZone(activeSelectedZone);
    }
  };

  // =====================
  // INPUT CHANGE
  // =====================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // =====================
  // LOCATION UPDATE
  // =====================
  const setLocation = (data: any) => {
    setIsUsingSavedAddress(false); // If user picks manually from map, disable saved address flag
    setSelectedAddressId("");
    setForm(prev => {
      const updatedLoc = data;
      processZonesAndLocation(updatedLoc, zones);
      return {
        ...prev,
        location: updatedLoc
      };
    });
  };

  // =====================
  // DELIVERY TYPE SWITCH
  // =====================
  const handleDeliveryTypeChange = (type: "regular" | "express") => {
    setDeliveryType(type);
    if (type === "express" && matchedExpressZone) {
      setSelectedZone(matchedExpressZone._id);
    } else if (matchedRegularZone) {
      setSelectedZone(matchedRegularZone._id);
    }
  };

  // =====================
  // CONTINUE PAYMENT
  // =====================
  const continuePayment = () => {
    setError("");

    if (!form.name.trim()) {
      setError("Name required");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone required");
      return;
    }

    // Map location check is optional if user selects a saved address
    if (!isUsingSavedAddress && (!form.location.latitude || !form.location.longitude)) {
      setError("Please select map location or choose a saved address");
      return;
    }

    if (!selectedZone) {
      setError("Select delivery area");
      return;
    }

    // save checkout data
    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        ...form,
        deliveryZone: selectedZone,
        deliveryType
      })
    );

    router.push("/checkout/payment");
  };

  if (cartLoading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CheckoutHeader />
        <CheckoutStepper currentStep={2} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* SAVED ADDRESSES SECTION */}
            {savedAddresses.length > 0 && (
              <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <Home size={18} /> Select from Saved Addresses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                        selectedAddressId === addr.id
                          ? "border-black bg-black/5 ring-1 ring-black"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-zinc-900">{addr.title || "Saved Address"}</p>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2">{addr.city}, {addr.street || addr.location?.formattedAddress}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-500">📞 {addr.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHIPPING */}
            <ShippingForm
              form={form}
              handleChange={handleChange}
            />

            {/* LOCATION */}
            <LocationPicker
              location={form.location}
              setLocation={setLocation}
            />

            {/* DELIVERY AREA - 2 Box Design (Regular & Express) */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Truck size={20} /> Choose Delivery Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Regular Delivery Box */}
                <div
                  onClick={() => handleDeliveryTypeChange("regular")}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                    deliveryType === "regular"
                      ? "border-black bg-black/5 ring-1 ring-black"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                      <Truck size={16} className="text-blue-600" /> Regular Delivery
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                      Available
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <Clock size={13} className="text-zinc-400" /> Time: <strong className="text-zinc-900">{matchedRegularZone?.estimatedDays || "3-5 Days"}</strong>
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin size={13} className="text-zinc-400" /> Fee: <strong className="text-zinc-900">{formatPrice(matchedRegularZone?.deliveryFee || 60)}</strong>
                    </p>
                  </div>
                </div>

                {/* Express Delivery Box */}
                <div
                  onClick={() => expressAvailable && handleDeliveryTypeChange("express")}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    !expressAvailable 
                      ? "opacity-60 bg-zinc-50 border-zinc-200 cursor-not-allowed" 
                      : deliveryType === "express"
                      ? "border-purple-600 bg-purple-50/30 ring-1 ring-purple-600 cursor-pointer"
                      : "border-zinc-200 hover:border-zinc-300 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                      <Zap size={16} className="text-purple-600" /> Express (3 Hours)
                    </span>
                    {expressAvailable ? (
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <CheckCircle size={11} /> Available
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-200 text-zinc-600 font-medium px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <XCircle size={11} /> Not Available
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 space-y-1">
                    {expressAvailable ? (
                      <>
                        <p className="flex items-center gap-1">
                          <Clock size={13} className="text-purple-500" /> Time: <strong className="text-zinc-900">{matchedExpressZone?.estimatedDays || "Within 3 Hours"}</strong>
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin size={13} className="text-purple-500" /> Fee: <strong className="text-zinc-900">{formatPrice(matchedExpressZone?.deliveryFee || 100)}</strong>
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-zinc-400 italic py-2">
                        আপনার লোকেশনে এক্সপ্রেস ডেলিভারি সমর্থিত নয়।
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* CONTINUE PAYMENT */}
            <button
              type="button"
              onClick={continuePayment}
              className="w-full rounded-xl bg-black py-4 font-bold text-white transition hover:bg-zinc-800"
            >
              Continue Payment
            </button>
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black mb-5">
                Order Items
              </h2>

              <div className="space-y-5">
                {items.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex gap-4 border-b pb-4 last:border-0"
                  >
                    {/* IMAGE */}
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                      <img
                        src={
                          item?.product?.images?.[0]?.url ||
                          item?.product?.images?.[0] ||
                          "/placeholder.png"
                        }
                        alt={
                          item?.product?.name || "Product"
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1">
                      <h3 className="font-bold line-clamp-2">
                        {item.product?.name}
                      </h3>

                      <div className="mt-2 flex justify-between text-sm text-zinc-500">
                        <span>
                          Qty: {item.quantity}
                        </span>
                        <span>
                          {formatPrice(
                            item.product?.discountPrice ||
                            item.product?.price ||
                            item.price
                          )}
                        </span>
                      </div>

                      <p className="mt-2 font-black">
                        {formatPrice(
                          (
                            item.product?.discountPrice ||
                            item.product?.price ||
                            item.price
                          ) * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
