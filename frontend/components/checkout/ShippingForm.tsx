"use client";

import {
  User,
  Phone,
  Pencil,
} from "lucide-react";
import { useState } from "react";

interface Props {
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ShippingForm({ form, handleChange }: Props) {
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Delivery Information</h2>
          <p className="text-sm text-zinc-500">Enter your delivery details</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* NAME */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Full Name
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute left-4 top-4 text-zinc-400"
            />
            <input
              name="name"
              value={form.name}
              readOnly
              className="w-full rounded-xl border bg-zinc-100 py-3 pl-12 pr-4 outline-none"
              placeholder="Your name"
            />
          </div>
        </div>

        {/* PHONE */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Bangladesh Phone Number
          </label>
          <div className="relative flex items-center gap-2">
            <div className="relative w-full">
              <Phone
                size={18}
                className="absolute left-4 top-4 text-zinc-400"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditingPhone}
                placeholder="017XXXXXXXX"
                className={`w-full rounded-xl border py-3 pl-12 pr-4 outline-none transition ${
                  isEditingPhone
                    ? "border-black bg-white focus:border-black"
                    : "border-zinc-200 bg-zinc-100 text-zinc-700"
                }`}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setIsEditingPhone(!isEditingPhone)}
              className="flex items-center gap-1.5 shrink-0 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition border border-blue-100 cursor-pointer"
            >
              <Pencil size={14} />
              {isEditingPhone ? "Save" : "Change"}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Example: 01712345678
          </p>
        </div>

        {/* COUNTRY */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Country
          </label>
          <input
            value="Bangladesh"
            readOnly
            className="w-full rounded-xl border bg-zinc-100 p-3"
          />
        </div>
      </div>
    </div>
  );
}
