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
} from "lucide-react";

import api from "@/services/api";
import useCart from "@/hooks/useCart";
import {
  useCurrency,
} from "@/context/CurrencyContext";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import LocationPicker from "@/components/checkout/LocationPicker";
import OrderSummary from "@/components/checkout/OrderSummary";
import {
  getDeliveryZones,
} from "@/services/deliveryZone.service";

// ======================================================
// TYPES
// ======================================================

type LocationData = {
  formattedAddress: string;
  division: string;
  district: string;
  area: string;
  road: string;
  latitude: string;
  longitude: string;
  googleMapLink: string;
};

type CheckoutForm = {
  name: string;
  phone: string;
  country: string;
  location: LocationData;
};

type DeliveryType = "regular" | "express";

// ======================================================
// HELPERS
// ======================================================

const cleanString = (value: any): string => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
};

// ======================================================
// PAGE
// ======================================================

export default function CheckoutPage() {
  const router = useRouter();

  // ====================================================
  // CART
  // ====================================================

  const {
    cart,
    loading: cartLoading,
  } = useCart();

  // ====================================================
  // CURRENCY
  // ====================================================

  const {
    formatPrice,
  } = useCurrency();

  // ====================================================
  // CART ITEMS
  // ====================================================

  const items = useMemo(
    () =>
      Array.isArray(cart?.items)
        ? cart.items
        : [],
    [cart]
  );

  // ====================================================
  // USER
  // ====================================================

  const [
    user,
    setUser,
  ] = useState<any>(null);

  const [
    userLoading,
    setUserLoading,
  ] = useState(true);

  // ====================================================
  // DELIVERY ZONES
  // ====================================================

  const [
    zones,
    setZones,
  ] = useState<any[]>([]);

  const [
    matchedRegularZone,
    setMatchedRegularZone,
  ] = useState<any>(null);

  const [
    matchedExpressZone,
    setMatchedExpressZone,
  ] = useState<any>(null);

  const [
    expressAvailable,
    setExpressAvailable,
  ] = useState(false);

  const [
    deliveryType,
    setDeliveryType,
  ] = useState<DeliveryType>(
    "regular"
  );

  const [
    selectedZone,
    setSelectedZone,
  ] = useState("");

  // ====================================================
  // LOCATION MODAL
  // ====================================================

  const [
    showLocationModal,
    setShowLocationModal,
  ] = useState(false);

  // ====================================================
  // ERROR
  // ====================================================

  const [
    error,
    setError,
  ] = useState("");

  // ====================================================
  // FORM
  // ====================================================

  const [
    form,
    setForm,
  ] = useState<CheckoutForm>({
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
    },
  });

  // ====================================================
  // SUBTOTAL (WITH DISCOUNT & VARIANT SUPPORT)
  // ====================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (
        total: number,
        item: any
      ) => {
        const product = item?.product || {};
        const variant = item?.variant || product?.variant || null;
        
        const basePrice = Number(
          variant?.price ??
            item?.price ??
            product?.price ??
            0
        );

        const discountPrice = Number(
          variant?.discountPrice ??
            item?.discountPrice ??
            product?.discountPrice ??
            0
        );

        const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
        const effectiveUnitPrice = hasDiscount ? discountPrice : basePrice;

        const quantity = Number(
          item?.quantity || 1
        );

        return (
          total +
          effectiveUnitPrice * quantity
        );
      },
      0
    );
  }, [items]);

  // ====================================================
  // PROCESS DELIVERY ZONES
  // ====================================================

  const processZonesAndLocation = (
    location: LocationData,
    allZones: any[]
  ) => {
    if (
      !Array.isArray(allZones) ||
      allZones.length === 0
    ) {
      setMatchedRegularZone(null);
      setMatchedExpressZone(null);
      setExpressAvailable(false);
      setSelectedZone("");
      return;
    }

    const district =
      cleanString(
        location?.district
      ).toLowerCase();

    const area =
      cleanString(
        location?.area
      ).toLowerCase();

    const formattedAddress =
      cleanString(
        location?.formattedAddress
      ).toLowerCase();

    const checkIsExpress = (
      zone: any
    ) => {
      const name =
        cleanString(
          zone?.name
        ).toLowerCase();

      const estimatedDays =
        cleanString(
          zone?.estimatedDays
        ).toLowerCase();

      const deliveryType =
        cleanString(
          zone?.deliveryType
        ).toLowerCase();

      return (
        name.includes("3 hour") ||
        name.includes("3-hour") ||
        name.includes("express") ||
        estimatedDays.includes(
          "3 hour"
        ) ||
        estimatedDays.includes(
          "3-hour"
        ) ||
        deliveryType === "express"
      );
    };

    const matchesLocation = (
      zone: any
    ) => {
      const zoneName =
        cleanString(
          zone?.name
        ).toLowerCase();

      const zoneDistrict =
        cleanString(
          zone?.district
        ).toLowerCase();

      const zoneArea =
        cleanString(
          zone?.area
        ).toLowerCase();

      if (
        !district &&
        !area &&
        !formattedAddress
      ) {
        return true;
      }

      if (
        district &&
        (
          zoneName.includes(
            district
          ) ||
          zoneDistrict.includes(
            district
          )
        )
      ) {
        return true;
      }

      if (
        area &&
        (
          zoneName.includes(
            area
          ) ||
          zoneArea.includes(
            area
          )
        )
      ) {
        return true;
      }

      if (
        formattedAddress &&
        zoneName.includes(
          formattedAddress
        )
      ) {
        return true;
      }

      if (
        zoneName.includes(
          "kishoreganj"
        )
      ) {
        return true;
      }

      return false;
    };

    const expressZones =
      allZones.filter(
        checkIsExpress
      );

    const matchingExpress =
      expressZones.find(
        matchesLocation
      );

    const finalExpress =
      matchingExpress ||
      expressZones[0] ||
      null;

    const regularZones =
      allZones.filter(
        (zone) =>
          !checkIsExpress(zone)
      );

    const matchingRegular =
      regularZones.find(
        matchesLocation
      );

    const finalRegular =
      matchingRegular ||
      regularZones[0] ||
      allZones[0] ||
      null;

    if (finalExpress) {
      setExpressAvailable(true);

      setMatchedExpressZone(
        finalExpress
      );
    } else {
      setExpressAvailable(false);

      setMatchedExpressZone(null);

      setDeliveryType(
        "regular"
      );
    }

    setMatchedRegularZone(
      finalRegular
    );

    if (
      deliveryType ===
        "express" &&
      finalExpress
    ) {
      setSelectedZone(
        String(
          finalExpress?._id || ""
        )
      );
    } else if (
      finalRegular
    ) {
      setSelectedZone(
        String(
          finalRegular?._id || ""
        )
      );
    }
  };

  // ====================================================
  // LOAD USER
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setUserLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          router.replace(
            "/login?redirect=/checkout"
          );

          return;
        }

        const response =
          await api.get(
            "/users/me"
          );

        if (!mounted) {
          return;
        }

        const userData =
          response?.data?.user ||
          response?.data;

        setUser(
          userData
        );

        let defaultLocation: LocationData =
          {
            formattedAddress:
              userData?.address ||
              userData?.location
                ?.formattedAddress ||
              "",

            division:
              userData?.division ||
              userData?.location
                ?.division ||
              "",

            district:
              userData?.district ||
              userData?.location
                ?.district ||
              "",

            area:
              userData?.area ||
              userData?.location
                ?.area ||
              "",

            road:
              userData?.road ||
              userData?.location
                ?.road ||
              "",

            latitude:
              userData?.latitude ||
              userData?.location
                ?.latitude ||
              "",

            longitude:
              userData?.longitude ||
              userData?.location
                ?.longitude ||
              "",

            googleMapLink:
              userData?.googleMapLink ||
              userData?.location
                ?.googleMapLink ||
              "",
          };

        const savedAddresses =
          localStorage.getItem(
            "user_addresses"
          );

        if (
          savedAddresses
        ) {
          try {
            const parsed =
              JSON.parse(
                savedAddresses
              );

            if (
              Array.isArray(
                parsed
              ) &&
              parsed.length > 0
            ) {
              const defaultAddress =
                parsed.find(
                  (
                    address: any
                  ) =>
                    address?.isDefault
                ) ||
                parsed[0];

              if (
                defaultAddress
              ) {
                defaultLocation =
                  {
                    formattedAddress:
                      defaultAddress?.street ||
                      defaultAddress
                        ?.location
                        ?.formattedAddress ||
                      defaultAddress
                        ?.formattedAddress ||
                      "",

                    division:
                      defaultAddress?.division ||
                      defaultAddress
                        ?.location
                        ?.division ||
                      "",

                    district:
                      defaultAddress?.city ||
                      defaultAddress?.district ||
                      defaultAddress
                        ?.location
                        ?.district ||
                      "",

                    area:
                      defaultAddress?.area ||
                      defaultAddress
                        ?.location
                        ?.area ||
                      "",

                    road:
                      defaultAddress?.road ||
                      defaultAddress
                        ?.location
                        ?.road ||
                      "",

                    latitude:
                      defaultAddress?.latitude ||
                      defaultAddress
                        ?.location
                        ?.latitude ||
                      "",

                    longitude:
                      defaultAddress?.longitude ||
                      defaultAddress
                        ?.location
                        ?.longitude ||
                      "",

                    googleMapLink:
                      defaultAddress?.googleMapLink ||
                      defaultAddress
                        ?.location
                        ?.googleMapLink ||
                      "",
                  };
              }
            }
          } catch (
            addressError
          ) {
            console.error(
              "ADDRESS PARSE ERROR:",
              addressError
            );
          }
        }

        setForm(
          (
            previous
          ) => ({
            ...previous,

            name:
              userData?.name ||
              previous.name,

            phone:
              userData?.phone ||
              previous.phone,

            location:
              defaultLocation,
          })
        );
      } catch (
        userError
      ) {
        console.error(
          "USER ERROR:",
          userError
        );

        router.replace(
          "/login?redirect=/checkout"
        );
      } finally {
        if (mounted) {
          setUserLoading(
            false
          );
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ====================================================
  // LOAD DELIVERY ZONES
  // ====================================================

  useEffect(() => {
    if (userLoading) {
      return;
    }

    let mounted = true;

    const loadZones = async () => {
      try {
        const response =
          await getDeliveryZones();

        if (!mounted) {
          return;
        }

        const activeZones =
          Array.isArray(response)
            ? response.filter(
                (zone: any) =>
                  zone?.active !== false
              )
            : [];

        setZones(
          activeZones
        );
      } catch (
        zoneError
      ) {
        console.error(
          "ZONE ERROR:",
          zoneError
        );

        setZones([]);
      }
    };

    loadZones();

    return () => {
      mounted = false;
    };
  }, [userLoading]);

  useEffect(() => {
    if (
      zones.length === 0
    ) {
      return;
    }

    processZonesAndLocation(
      form.location,
      zones
    );

  }, [
    zones,
    form.location.district,
    form.location.area,
    form.location.formattedAddress,
  ]);

  const setLocation = (
    locationData: any
  ) => {
    const updatedLocation: LocationData =
      {
        formattedAddress:
          locationData
            ?.formattedAddress ||
          "",

        division:
          locationData
            ?.division ||
          "",

        district:
          locationData
            ?.district ||
          "",

        area:
          locationData
            ?.area ||
          "",

        road:
          locationData
            ?.road ||
          "",

        latitude:
          locationData
            ?.latitude ||
          "",

        longitude:
          locationData
            ?.longitude ||
          "",

        googleMapLink:
          locationData
            ?.googleMapLink ||
          "",
      };

    setForm(
      (
        previous
      ) => ({
        ...previous,

        location:
          updatedLocation,
      })
    );

    setShowLocationModal(
      false
    );

    setError("");
  };

  const handleDeliveryTypeChange = (
    type: DeliveryType
  ) => {
    if (
      type === "express"
    ) {
      if (
        !expressAvailable ||
        !matchedExpressZone
      ) {
        return;
      }

      setDeliveryType(
        "express"
      );

      setSelectedZone(
        String(
          matchedExpressZone?._id ||
            ""
        )
      );

      return;
    }

    setDeliveryType(
      "regular"
    );

    if (
      matchedRegularZone
    ) {
      setSelectedZone(
        String(
          matchedRegularZone?._id ||
            ""
        )
      );
    }
  };

  const regularFeeAmount =
    useMemo(() => {
      if (
        !matchedRegularZone
      ) {
        return 60;
      }

      const freeDeliveryAbove =
        Number(
          matchedRegularZone
            ?.freeDeliveryAbove
        ) ||
        Number(
          matchedRegularZone
            ?.minOrderAmount
        ) ||
        0;

      if (
        freeDeliveryAbove >
          0 &&
        subtotal >=
          freeDeliveryAbove
      ) {
        return 0;
      }

      const fee =
        Number(
          matchedRegularZone
            ?.deliveryFee
        );

      return Number.isFinite(
        fee
      )
        ? fee
        : 60;
    }, [
      matchedRegularZone,
      subtotal,
    ]);

  const expressFeeAmount =
    useMemo(() => {
      if (
        !matchedExpressZone
      ) {
        return 50;
      }

      const fee =
        Number(
          matchedExpressZone
            ?.expressFee ??
            matchedExpressZone
              ?.expressDeliveryFee ??
            matchedExpressZone
              ?.charge ??
            50
        );

      return Number.isFinite(
        fee
      )
        ? fee
        : 50;
    }, [
      matchedExpressZone,
    ]);

  const shippingFee =
    useMemo(() => {
      if (
        deliveryType ===
        "express"
      ) {
        return (
          regularFeeAmount +
          expressFeeAmount
        );
      }

      return regularFeeAmount;
    }, [
      deliveryType,
      regularFeeAmount,
      expressFeeAmount,
    ]);

  const grandTotal =
    useMemo(() => {
      return (
        subtotal +
        shippingFee
      );
    }, [
      subtotal,
      shippingFee,
    ]);

  const continuePayment =
    () => {
      setError("");

      if (
        items.length === 0
      ) {
        setError(
          "Your cart is empty."
        );

        return;
      }

      if (
        !form.name.trim()
      ) {
        setError(
          "Please provide your full name for delivery."
        );

        return;
      }

      if (
        !form.phone.trim()
      ) {
        setError(
          "Please provide a valid contact number."
        );

        return;
      }

      if (
        !form.location
          .latitude
      ) {
        setError(
          "Please pin your exact delivery location on the map."
        );

        return;
      }

      if (
        !form.location
          .longitude
      ) {
        setError(
          "Please pin your exact delivery location on the map."
        );

        return;
      }

      if (
        !selectedZone
      ) {
        setError(
          "Please select a valid delivery zone/method."
        );

        return;
      }

      if (
        deliveryType ===
          "express" &&
        !expressAvailable
      ) {
        setError(
          "Express delivery is not available for this location."
        );

        return;
      }

      const checkoutData =
        {
          name:
            form.name,

          phone:
            form.phone,

          country:
            form.country,

          location:
            form.location,

          deliveryZone:
            selectedZone,

          deliveryType,

          subtotal,

          regularDeliveryFee:
            regularFeeAmount,

          expressFee:
            deliveryType ===
            "express"
              ? expressFeeAmount
              : 0,

          shippingFee,

          grandTotal,
        };

      sessionStorage.setItem(
        "checkoutData",
        JSON.stringify(
          checkoutData
        )
      );

      router.push(
        "/checkout/payment"
      );
    };

  if (
    cartLoading ||
    userLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-900" />
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Preparing Secure Checkout...
          </p>
        </div>
      </div>
    );
  }

  if (
    items.length === 0
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
            <Truck className="text-zinc-500" size={24} />
          </div>
          <h1 className="text-lg font-bold text-zinc-900">
            Your Cart Is Empty
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Add some products to your cart before continuing to checkout.
          </p>
          <button
            type="button"
            onClick={() =>
              router.push(
                "/shop"
              )
            }
            className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white transition hover:bg-zinc-800"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/50 pb-20 pt-8 text-zinc-900 selection:bg-black selection:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <CheckoutHeader />
          <div className="mt-4">
            <CheckoutStepper currentStep={2} />
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <div className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-zinc-900">
                    <MapPin className="text-zinc-600" size={16} />
                    Delivery Address & Details
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Your default address is loaded below. You can update it anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setShowLocationModal(
                      true
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95"
                >
                  <Plus size={14} />
                  Add New Location
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Recipient Contact
                  </p>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                      <User className="text-zinc-400" size={14} />
                      {form.name ||
                        "Name not provided"}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-zinc-600">
                      <Phone className="text-zinc-400" size={14} />
                      {form.phone ||
                        "Phone not provided"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Delivery Address
                  </p>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                      <MapPin className="shrink-0 text-zinc-400" size={14} />
                      <span className="line-clamp-1">
                        {form.location
                          .district ||
                          "District not selected"}
                      </span>
                    </p>
                    <p className="line-clamp-2 pl-5 text-xs leading-relaxed text-zinc-500">
                      {form.location
                        .formattedAddress ||
                        form.location
                          .area ||
                        "No address found. Click 'Add New Location'."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {showLocationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                <div className="relative max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-zinc-900">
                      <MapPin size={16} />
                      Update / Pin New Location
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setShowLocationModal(
                          false
                        )
                      }
                      className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                  <LocationPicker
                    location={form.location}
                    setLocation={setLocation}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-zinc-900">
                  <Truck className="text-zinc-600" size={16} />
                  Choose Delivery Method
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Select standard speed or priority express shipment.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDeliveryTypeChange(
                      "regular"
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition-all ${
                    deliveryType ===
                    "regular"
                      ? "border-zinc-900 bg-zinc-900/[0.02] ring-1 ring-zinc-900"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                      <Truck className="text-blue-600" size={15} />
                      Regular Delivery
                    </span>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700">
                      STANDARD
                    </span>
                  </div>

                  <div className="space-y-1 pt-3 text-xs text-zinc-600">
                    <p className="flex items-center gap-1.5">
                      <Clock className="text-zinc-400" size={13} />
                      Estimated:
                      <strong className="text-zinc-900">
                        {matchedRegularZone
                          ?.estimatedDays ||
                          "3-5 Days"}
                      </strong>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="text-zinc-400" size={13} />
                      Delivery Fee:
                      <strong className="text-zinc-900">
                        {regularFeeAmount ===
                        0 ? (
                          <span className="font-bold text-emerald-600">
                            FREE
                          </span>
                        ) : (
                          formatPrice(
                            regularFeeAmount
                          )
                        )}
                      </strong>
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={
                    !expressAvailable
                  }
                  onClick={() =>
                    handleDeliveryTypeChange(
                      "express"
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition-all ${
                    !expressAvailable
                      ? "cursor-not-allowed border-zinc-200 bg-zinc-50/50 opacity-50"
                      : deliveryType ===
                        "express"
                      ? "cursor-pointer border-amber-500 bg-amber-50/30 ring-1 ring-amber-500"
                      : "cursor-pointer border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                      <Zap className="fill-amber-500 text-amber-500" size={15} />
                      Express (3 Hours)
                    </span>
                    {expressAvailable ? (
                      <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800">
                        <CheckCircle size={10} />
                        AVAILABLE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                        <XCircle size={10} />
                        UNAVAILABLE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pt-3 text-xs text-zinc-600">
                    {expressAvailable ? (
                      <>
                        <p className="flex items-center gap-1.5">
                          <Clock className="text-amber-500" size={13} />
                          Estimated:
                          <strong className="text-zinc-900">
                            {matchedExpressZone
                              ?.estimatedDays ||
                              "Within 3 Hours"}
                          </strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="text-amber-500" size={13} />
                          Regular Delivery:
                          <strong className="text-zinc-900">
                            {regularFeeAmount ===
                            0 ? (
                              <span className="font-bold text-emerald-600">
                                FREE
                              </span>
                            ) : (
                              formatPrice(
                                regularFeeAmount
                              )
                            )}
                          </strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Zap className="text-amber-500" size={13} />
                          Express Fee:
                          <strong className="text-zinc-900">
                            {formatPrice(
                              expressFeeAmount
                            )}
                          </strong>
                        </p>
                      </>
                    ) : (
                      <p className="py-1 text-xs italic text-zinc-400">
                        Express delivery is currently not supported for this region.
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
                <XCircle className="shrink-0" size={16} />
                <span>
                  {error}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-8 lg:col-span-5 xl:col-span-4">
            <OrderSummary
              deliveryType={deliveryType}
              expressFee={expressFeeAmount}
              items={items}
              onPlaceOrder={continuePayment}
              placeOrderLoading={false}
              regularDeliveryFee={regularFeeAmount}
              shipping={shippingFee}
              showPlaceOrderButton={true}
              subtotal={subtotal}
              total={grandTotal}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
