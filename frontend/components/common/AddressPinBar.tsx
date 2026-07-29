"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, Check, Plus, Home, Briefcase } from "lucide-react";
import Link from "next/link";
import { getDeliveryZones } from "@/services/deliveryZone.service";

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

export default function AddressPinBar() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [hasExpressAvailable, setHasExpressAvailable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Scroll direction state for hide/show effect
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsOpen(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const loadAddresses = (zones: any[]) => {
    const localData = localStorage.getItem("user_addresses");
    if (localData) {
      try {
        const parsed: Address[] = JSON.parse(localData);
        setAddresses(parsed);

        const savedId = localStorage.getItem("selected_address_id");
        const found = parsed.find((a) => a.id === savedId) || parsed.find((a) => a.isDefault) || parsed[0];

        if (found) {
          setSelectedAddress(found);
          localStorage.setItem("selected_address_id", found.id);
          checkExpressAvailability(found, zones);
        } else {
          setSelectedAddress(null);
          setHasExpressAvailable(false);
        }
      } catch (e) {
        console.error("Error loading local addresses:", e);
      }
    } else {
      setAddresses([]);
      setSelectedAddress(null);
      setHasExpressAvailable(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let zones: any[] = [];
      try {
        const resZones = await getDeliveryZones();
        if (Array.isArray(resZones)) {
          zones = resZones;
          setDeliveryZones(zones);
        }
      } catch (error) {
        console.error("Failed to load delivery zones", error);
      }

      loadAddresses(zones);
    };

    fetchData();

    const handleStorageChange = () => {
      loadAddresses(deliveryZones);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("deliveryAddressChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("deliveryAddressChanged", handleStorageChange);
    };
  }, []);

  const checkExpressAvailability = (address: Address, zones: any[]) => {
    if (!address || zones.length === 0) {
      setHasExpressAvailable(false);
      return;
    }

    const addressCity = address.city?.toLowerCase() || "";
    const addressArea = (address.street || address.location?.formattedAddress || "").toLowerCase();

    const isExpressSupported = zones.some((zone) => {
      const zoneName = zone.name.toLowerCase();
      const isExpressZone = zoneName.includes("3 hours") || zoneName.includes("[3 hours]");
      
      if (!isExpressZone || !zone.active) return false;

      return zoneName.includes(addressCity) || zoneName.includes(addressArea);
    });

    setHasExpressAvailable(isExpressSupported);
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddress(addr);
    localStorage.setItem("selected_address_id", addr.id);
    setIsOpen(false);
    
    checkExpressAvailability(addr, deliveryZones);
    window.dispatchEvent(new Event("deliveryAddressChanged"));
  };

  return (
    <div
      className={`
        fixed 
        inset-x-0 
        top-[57px] 
        sm:top-[65px] 
        z-40 
        bg-gray-50/95 
        backdrop-blur-md
        border-b 
        border-gray-200 
        py-2 
        px-4 
        sm:px-8 
        shadow-xs 
        transition-transform 
        duration-300 
        ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium flex items-center gap-1">
            <MapPin size={15} className="text-black" /> Deliver to:
          </span>
          
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 font-bold text-black bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs hover:border-black transition cursor-pointer"
            >
              <span className="truncate max-w-[200px] sm:max-w-md">
                {selectedAddress ? (
                  <span className="font-normal text-gray-700">
                    <strong className="text-black">{selectedAddress.title}:</strong> {selectedAddress.street || selectedAddress.location?.formattedAddress}, {selectedAddress.city}
                  </span>
                ) : (
                  "Add Delivery Address"
                )}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Choose Your Location</h4>
                    <p className="text-[11px] text-gray-400">Select where you want your order delivered</p>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto py-2 px-2 space-y-1.5">
                  {addresses.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-gray-500 mb-3">No saved addresses found.</p>
                      <Link
                        href="/dashboard/address"
                        onClick={() => setIsOpen(false)}
                        className="inline-block bg-black text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-gray-800 transition"
                      >
                        Pin New Location
                      </Link>
                    </div>
                  ) : (
                    addresses.map((addr) => {
                      const isSelected = selectedAddress?.id === addr.id;
                      return (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`w-full text-left p-3 rounded-xl text-xs flex items-start justify-between transition cursor-pointer border ${
                            isSelected 
                              ? "bg-gray-50 border-black shadow-2xs" 
                              : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 overflow-hidden">
                            <span className="mt-0.5 p-1.5 bg-gray-100 text-gray-700 rounded-lg shrink-0">
                              {addr.type === "home" ? <Home size={14} /> : addr.type === "work" ? <Briefcase size={14} /> : <MapPin size={14} />}
                            </span>
                            <div className="flex flex-col overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-black">{addr.title}</span>
                                {addr.isDefault && (
                                  <span className="bg-gray-200 text-gray-700 text-[9px] font-semibold px-1.5 py-0.2 rounded">Default</span>
                                )}
                              </div>
                              <span className="text-gray-600 truncate mt-0.5 font-normal">
                                {addr.street || addr.location?.formattedAddress}, {addr.city}
                              </span>
                              <span className="text-[11px] text-gray-400 mt-0.5">
                                Phone: {addr.phone}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check size={16} className="text-black shrink-0 mt-1" />}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 px-3 border-t border-gray-100 mt-1">
                  <Link 
                    href="/dashboard/address" 
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 bg-black text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-800 transition cursor-pointer shadow-sm"
                  >
                    <Plus size={14} /> Add New Address / Manage
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 font-medium">
          {hasExpressAvailable && (
            <>
              <span className="text-purple-600 font-semibold">⚡ 3 Hours Express Available</span>
              <span>•</span>
            </>
          )}
          <span>📦 Regular Delivery & COD</span>
        </div>

      </div>
    </div>
  );
}
