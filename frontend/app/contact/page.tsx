"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Ekhane tumer backend API ba email service-er call thakbe
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-4 text-gray-500 text-sm md:text-base">
          Have any questions about our products or need help? Feel free to reach out to us anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info */}
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-black text-white rounded-2xl">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                <p className="text-gray-900 font-medium mt-1">+880 1234 567890</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-black text-white rounded-2xl">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-gray-900 font-medium mt-1">support@yourdomain.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-black text-white rounded-2xl">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                <p className="text-gray-900 font-medium mt-1">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-600 border border-emerald-100">
              Thank you! Your message has been sent successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Message
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black text-white py-3.5 text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
