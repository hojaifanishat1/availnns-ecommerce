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
  User,
  Phone,
  Plus,
  ArrowRight,
  Lock,
} from "lucide-react";
import api from "@/services/api";
import useCart from "@/hooks/useCart";
import {
  useCurrency,
} from "@/context/CurrencyContext";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
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
  
  // Modal / Map Popup State for Add New Location
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

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
  // PROCESS ZONES BASED ON LOCATION
  // =====================
  const processZonesAndLocation = (loc: any, allZones: any[], currentDeliveryType = deliveryType) => {
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

    let activeExpressAvailable = false;
    if (foundExpress) {
      activeExpressAvailable = true;
      setExpressAvailable(true);
      setMatchedExpressZone(foundExpress);
    } else {
      setExpressAvailable(false);
      setMatchedExpressZone(null);
      if (currentDeliveryType === "express") {
        setDeliveryType("regular");
      }
    }

    const activeSelectedZone = (currentDeliveryType === "express" && activeExpressAvailable && foundExpress) 
      ? foundExpress._id 
      : finalRegular?._id;
      
    if (activeSelectedZone) {
      setSelectedZone(activeSelectedZone);
    }
  };

  // =====================
  // LOAD USER & DEFAULT ADDRESS
  // =====================
  useEffect(() => {
    const loadUserAndDefaultAddress = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login?redirect=/checkout");
          return;
        }

        const res = await api.get("/users/me");
        const userData = res.data.user;
        setUser(userData);

        let defaultLoc = {
          formattedAddress: userData?.address || userData?.location?.formattedAddress || "",
          division: userData?.division || "",
          district: userData?.district || "",
          area: userData?.area || "",
          road: userData?.road || "",
          latitude: userData?.latitude || userData?.location?.latitude || "",
          longitude: userData?.longitude || userData?.location?.longitude || "",
          googleMapLink: userData?.googleMapLink || "",
        };

        // Check local storage addresses if available
        const localData = localStorage.getItem("user_addresses");
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const defaultAddr = parsed.find((a) => a.isDefault) || parsed[0];
              if (defaultAddr) {
                defaultLoc = {
                  formattedAddress: defaultAddr.street || defaultAddr.location?.formattedAddress || "",
                  division: defaultAddr.division || "",
                  district: defaultAddr.city || defaultAddr.district || "",
                  area: defaultAddr.area || "",
                  road: defaultAddr.road || "",
                  latitude: defaultAddr.latitude || defaultAddr.location?.latitude || "",
                  longitude: defaultAddr.longitude || defaultAddr.location?.longitude || "",
                  googleMapLink: defaultAddr.googleMapLink || "",
                };
              }
            }
          } catch (e) {
            console.error("Error parsing saved addresses", e);
          }
        }

        setForm(prev => ({
          ...prev,
          name: userData?.name || prev.name,
          phone: userData?.phone || prev.phone,
          location: defaultLoc,
        }));
      } catch (error) {
        console.log("USER ERROR", error);
        router.replace("/login?redirect=/login");
      } finally {
        setUserLoading(false);
      }
    };

    loadUserAndDefaultAddress();
  }, [router]);

  // =====================
  // LOAD DELIVERY ZONE
  // =====================
  useEffect(() => {
    const loadZones = async () => {
      try {
        const data = await getDeliveryZones();
        const activeZones = Array.isArray(data) ? data.filter((z: any) => z.active) : [];
        setZones(activeZones);

        processZonesAndLocation(form.location, activeZones, deliveryType);
      } catch (error) {
        console.log("ZONE ERROR", error);
      }
    };

    if (!userLoading) {
      loadZones();
    }
  }, [userLoading, form.location]);

  // =====================
  // LOCATION UPDATE
  // =====================
  const setLocation = (data: any) => {
    setForm(prev => {
      const updatedLoc = data;
      processZonesAndLocation(updatedLoc, zones, deliveryType);
      return {
        ...prev,
        location: updatedLoc
      };
    });
    setShowLocationModal(false);
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
      setError("Please provide your full name for delivery.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please provide a valid contact number.");
      return;
    }

    if (!form.location.latitude || !form.location.longitude) {
      setError("Please pin your exact delivery location on the map.");
      return;
    }

    if (!selectedZone) {
      setError("Please select a valid delivery zone/method.");
      return;
    }

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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-900" />
          <p className="text-xs font-medium text-zinc-500 tracking-wide uppercase">Preparing Secure Checkout...</p>
        </div>
      </div>
    );
  }

  // Calculate Subtotal & Shipping Fee for Summary
  const subtotal = items.reduce((acc: number, item: any) => {
    const price = item?.product?.discountPrice || item?.product?.price || item?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = deliveryType === "express" 
    ? (matchedExpressZone?.deliveryFee || 100) 
    : (matchedRegularZone?.deliveryFee || 60);

  const grandTotal = subtotal + shippingFee;

  return (
    <main className="min-h-screen bg-zinc-50/50 pb-20 pt-8 text-zinc-900 selection:bg-black selection:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Progress */}
        <div className="mb-8">
          <CheckoutHeader />
          <div className="mt-4">
            <CheckoutStepper currentStep={2} />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT CONTENT AREA (8 Cols) */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            
            {/* DELIVERY TO DEFAULT / PIN ADDRESS & ADD NEW LOCATION */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm/50 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold tracking-tight flex items-center gap-2 text-zinc-900 uppercase">
                    <MapPin size={16} className="text-zinc-600" /> Delivery Address & Details
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Your default address is loaded below. You can update it anytime.</p>
                </div>
                
                {/* Add New Location Button */}
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:bg-zinc-800 shadow-sm active:scale-95"
                >
                  <Plus size={14} /> Add New Location
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Card */}
                <div className="space-y-2 bg-zinc-50/70 p-4 rounded-xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Recipient Contact</p>
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                      <User size={14} className="text-zinc-400" /> {form.name || "Name not provided"}
                    </p>
                    <p className="text-xs text-zinc-600 flex items-center gap-2">
                      <Phone size={14} className="text-zinc-400" /> {form.phone || "Phone not provided"}
                    </p>
                  </div>
                </div>

                {/* Location Card */}
                <div className="space-y-2 bg-zinc-50/70 p-4 rounded-xl border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Default Delivery Address</p>
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-400 shrink-0" /> 
                      <span className="line-clamp-1">{form.location.district || "District not selected"}</span>
                    </p>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed pl-5">
                      {form.location.formattedAddress || form.location.area || "No address found. Click 'Add New Location'."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MAP LOCATION PICKER MODAL POPUP */}
            {showLocationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn">
                <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-900 uppercase">
                      <MapPin size={16} className="text-zinc-900" /> Update / Pin New Location
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(false)}
                      className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 transition-colors"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  {/* Location Picker Component */}
                  <LocationPicker
                    location={form.location}
                    setLocation={setLocation}
                  />
                </div>
              </div>
            )}

            {/* CHOOSE DELIVERY METHOD */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm/50 space-y-4">
              <div>
                <h2 className="text-sm font-bold tracking-tight flex items-center gap-2 text-zinc-900 uppercase">
                  <Truck size={16} className="text-zinc-600" /> Choose Delivery Method
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Select standard speed or priority express shipment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Regular Delivery Box */}
                <div
                  onClick={() => handleDeliveryTypeChange("regular")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    deliveryType === "regular"
                      ? "border-zinc-900 bg-zinc-900/[0.02] ring-1 ring-zinc-900"
                      : "border-zinc-200 hover:border-zinc-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                      <Truck size={15} className="text-blue-600" /> Regular Delivery
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded tracking-wide">
                      STANDARD
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600 space-y-1 pt-1">
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} className="text-zinc-400" /> Estimated: <strong className="text-zinc-900">{matchedRegularZone?.estimatedDays || "3-5 Days"}</strong>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-zinc-400" /> Charge: <strong className="text-zinc-900">{formatPrice(matchedRegularZone?.deliveryFee || 60)}</strong>
                    </p>
                  </div>
                </div>

                {/* Express Delivery Box */}
                <div
                  onClick={() => expressAvailable && handleDeliveryTypeChange("express")}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    !expressAvailable 
                      ? "opacity-50 bg-zinc-50/50 border-zinc-200 cursor-not-allowed" 
                      : deliveryType === "express"
                      ? "border-amber-500 bg-amber-50/30 ring-1 ring-amber-500 cursor-pointer"
                      : "border-zinc-200 hover:border-zinc-300 bg-white cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                      <Zap size={15} className="text-amber-500 fill-amber-500" /> Express (3 Hours)
                    </span>
                    {expressAvailable ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 tracking-wide">
                        <CheckCircle size={10} /> AVAILABLE
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-200 text-zinc-600 font-medium px-2 py-0.5 rounded flex items-center gap-1">
                        <XCircle size={10} /> UNAVAILABLE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 space-y-1 pt-1">
                    {expressAvailable ? (
                      <>
                        <p className="flex items-center gap-1.5">
                          <Clock size={13} className="text-amber-500" /> Estimated: <strong className="text-zinc-900">{matchedExpressZone?.estimatedDays || "Within 3 Hours"}</strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-amber-500" /> Charge: <strong className="text-zinc-900">{formatPrice(matchedExpressZone?.deliveryFee || 100)}</strong>
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-zinc-400 italic py-1">
                        Express delivery is currently not supported for this region.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 flex items-center gap-2">
                <XCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* RIGHT ORDER SUMMARY STICKY SIDEBAR (5 Cols) */}
          <div className="lg:sticky lg:top-8 lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm/50 space-y-5">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight border-b border-zinc-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-medium text-zinc-500">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {items.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex gap-3.5 border-b border-zinc-100 pb-3.5 last:border-0"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-zinc-100 shrink-0 border border-zinc-100">
                      <img
                        src={
                          item?.product?.images?.[0]?.url ||
                          item?.product?.images?.[0] ||
                          "/placeholder.png"
                        }
                        alt={item?.product?.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs line-clamp-2 text-zinc-900">
                        {item.product?.name}
                      </h3>
                      <div className="mt-1.5 flex justify-between text-xs text-zinc-500 font-medium">
                        <span>Qty: {item.quantity}</span>
                        <span className="text-zinc-900 font-bold">
                          {formatPrice(
                            (item.product?.discountPrice || item.product?.price || item.price) * item.quantity
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee ({deliveryType})</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 pt-3 border-t border-dashed border-zinc-200">
                  <span>Total Amount</span>
                  <span className="text-base">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Secure Continue Button */}
              <button
                type="button"
                onClick={continuePayment}
                className="w-full rounded-xl bg-zinc-900 py-4 text-xs font-bold text-white transition-all hover:bg-zinc-800 shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Continue to Payment</span>
                <ArrowRight size={15} />
              </button>

              {/* Trust & Security Badge */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-medium text-center">
                <Lock size={13} className="text-emerald-600" />
                <span>Encrypted & Safe Checkout Experience</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
