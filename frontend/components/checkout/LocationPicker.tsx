"use client";

import { useState } from "react";
import {
  MapPin,
  CheckCircle,
  Loader2,
  Search,
} from "lucide-react";

interface Props {
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
  setLocation: (data: any) => void;
}

export default function LocationPicker({ location, setLocation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    location?.latitude && location?.longitude 
      ? { lat: Number(location.latitude), lng: Number(location.longitude) } 
      : { lat: 23.8103, lng: 90.4125 } // Default Dhaka coordinates
  );

  const [tempLocation, setTempLocation] = useState(location);

  // Fetch Address from Lat/Lng
  const fetchAddressDetails = async (lat: number, lng: number) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.address || {};

      const locationData = {
        formattedAddress: data.display_name || "",
        division: address.state || address.region || "",
        district: address.city || address.town || address.county || "",
        area: address.suburb || address.neighbourhood || address.residential || "",
        road: address.road || "",
        latitude: String(lat),
        longitude: String(lng),
        googleMapLink: `https://www.google.com/maps?q=${lat},${lng}`,
      };

      setTempLocation(locationData);
    } catch (err) {
      setError("Failed to fetch address details.");
    } finally {
      setLoading(false);
    }
  };

  // Search Location Handler
  const handleSearchLocation = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSuggestions(data.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    setCoords({ lat, lng });
    setSearchQuery(item.display_name);
    setSuggestions([]);
    fetchAddressDetails(lat, lng);
  };

  // Use Browser Current Location Button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        fetchAddressDetails(lat, lng);
      },
      (err) => {
        setError("Please allow location permission in your browser.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmSaveAddress = () => {
    if (!tempLocation.latitude || !tempLocation.longitude) {
      setError("Please select or search a valid location first.");
      return;
    }
    setLocation(tempLocation);
  };

  // OpenStreetMap Bounding Box for iframe embed view
  const bbox = `${coords.lng - 0.01},${coords.lat - 0.01},${coords.lng + 0.01},${coords.lat + 0.01}`;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`;

  return (
    <div className="space-y-4">
      {/* Search Bar & Current Location Button */}
      <div className="space-y-2">
        <div className="relative">
          <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900 transition-all">
            <Search size={16} className="text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchLocation(e.target.value)}
              placeholder="Search area, road or district in Bangladesh..."
              className="w-full bg-transparent text-xs text-zinc-900 focus:outline-none"
            />
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
              {suggestions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSuggestion(item)}
                  className="cursor-pointer px-3 py-2.5 text-xs text-zinc-700 hover:bg-zinc-100 border-b border-zinc-100 last:border-0"
                >
                  {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <MapPin size={14} className="text-zinc-600" />
          <span>Use My Current GPS Location</span>
        </button>
      </div>

      {/* Embedded Map Container (Guaranteed to Load) */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl border border-zinc-200 overflow-hidden shadow-inner bg-zinc-100">
        <iframe
          title="Location Map"
          width="100%"
          height="100%"
          src={mapEmbedUrl}
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
        />
        
        {/* Center Marker Pin Overlay Indicator */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-6">
          <div className="bg-zinc-900 text-white p-2 rounded-full shadow-lg animate-bounce">
            <MapPin size={20} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 py-1">
          <Loader2 size={14} className="animate-spin text-zinc-900" />
          <span>Fetching address details...</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {/* Selected Address Preview Box */}
      {tempLocation?.latitude && (
        <div className="space-y-3 rounded-xl bg-zinc-50 p-4 border border-zinc-200">
          <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 uppercase tracking-wide">
            <CheckCircle size={15} className="text-emerald-600" />
            Selected Location Preview
          </div>

          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-zinc-200">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">District</p>
              <p className="font-semibold text-zinc-900 mt-0.5">{tempLocation.district || "-"}</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-zinc-200">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Area</p>
              <p className="font-semibold text-zinc-900 mt-0.5">{tempLocation.area || "-"}</p>
            </div>
          </div>

          <div className="bg-white p-2 rounded-lg border border-zinc-200 text-xs">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Full Address</p>
            <p className="font-medium text-zinc-800 mt-0.5 leading-relaxed">{tempLocation.formattedAddress}</p>
          </div>
        </div>
      )}

      {/* Save Address Button */}
      <button
        type="button"
        onClick={handleConfirmSaveAddress}
        className="w-full rounded-xl bg-zinc-900 py-3.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <MapPin size={16} />
        <span>Save Address</span>
      </button>
    </div>
  );
}
