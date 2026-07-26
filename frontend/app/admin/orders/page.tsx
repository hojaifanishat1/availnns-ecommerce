"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Eye,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  PackageX,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Trash2,
  Copy,
  MapPin,
} from "lucide-react";
import { getAdminOrders } from "@/services/order.service"; 
import { toast } from "sonner";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const dateOptions = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
];

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
    case "processing": return "bg-sky-50 text-sky-700 border-sky-200";
    case "shipped": return "bg-purple-50 text-purple-700 border-purple-200";
    case "pending": return "bg-amber-50 text-amber-800 border-amber-200";
    default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  // Pagination & Bulk Actions
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // =========================
  // LOAD ORDERS
  // =========================
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getAdminOrders();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        toast.error("Failed to fetch orders from server");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  // =========================
  // DEBOUNCED SEARCH
  // =========================
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // =========================
  // FILTER LOGIC
  // =========================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = debouncedSearch.toLowerCase();
      const matchSearch =
        order._id?.toLowerCase().includes(keyword) ||
        order.user?.name?.toLowerCase().includes(keyword) ||
        order.user?.email?.toLowerCase().includes(keyword) ||
        order.shippingAddress?.phone?.toLowerCase().includes(keyword) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(keyword);

      const matchStatus = status === "all" ? true : order.orderStatus === status;

      let matchDate = true;
      if (dateRange !== "all" && order.createdAt) {
        const orderDate = new Date(order.createdAt).getTime();
        const now = new Date().getTime();
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateRange === "7days") matchDate = diffDays <= 7;
        if (dateRange === "30days") matchDate = diffDays <= 30;
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, debouncedSearch, status, dateRange]);

  // =========================
  // PAGINATION LOGIC
  // =========================
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // =========================
  // SELECTION & BULK ACTIONS
  // =========================
  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o._id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!selectedOrders.length || !newStatus) return;
    const confirmUpdate = window.confirm(`Update ${selectedOrders.length} orders to '${newStatus.toUpperCase()}'?`);
    if (!confirmUpdate) return;

    setIsBulkLoading(true);
    try {
      setOrders(orders.map(o => 
        selectedOrders.includes(o._id) ? { ...o, orderStatus: newStatus } : o
      ));
      setSelectedOrders([]);
      toast.success(`Successfully updated ${selectedOrders.length} orders!`);
    } catch (error) {
      toast.error("Failed to perform bulk update");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedOrders.length) return;
    const confirmDelete = window.confirm(`WARNING: Delete ${selectedOrders.length} orders permanently?`);
    if (!confirmDelete) return;

    setIsBulkLoading(true);
    try {
      setOrders(orders.filter(o => !selectedOrders.includes(o._id)));
      setSelectedOrders([]);
      toast.success(`Successfully deleted selected orders`);
    } catch (error) {
      toast.error("Failed to delete orders");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Order ID copied!");
  };

  const exportToCSV = () => {
    if (!filteredOrders.length) return toast.error("No data available to export");
    
    const headers = ["Order ID", "Customer Name", "Phone", "Address", "Total Amount", "Status", "Date"];
    const csvData = filteredOrders.map(o => [
      o._id,
      `"${o.shippingAddress?.fullName || o.user?.name || 'Guest'}"`,
      o.shippingAddress?.phone || "N/A",
      `"${o.shippingAddress?.address || ''}, ${o.shippingAddress?.city || ''}"`,
      o.totalPrice,
      o.orderStatus,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"
    ].join(","));

    const csvString = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("CSV Exported successfully!");
  };

  const stats = [
    { title: "Total Orders", value: orders.length, icon: ShoppingCart, light: "bg-blue-50 text-blue-600" },
    { title: "Pending", value: orders.filter((o) => o.orderStatus === "pending").length, icon: Clock, light: "bg-amber-50 text-amber-600" },
    { title: "Delivered", value: orders.filter((o) => o.orderStatus === "delivered").length, icon: CheckCircle, light: "bg-emerald-50 text-emerald-600" },
    { title: "Cancelled", value: orders.filter((o) => o.orderStatus === "cancelled").length, icon: XCircle, light: "bg-rose-50 text-rose-600" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-zinc-500">
        <Loader2 size={36} className="animate-spin text-black" />
        <p className="font-bold tracking-wide text-zinc-600 animate-pulse">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* HEADER & EXPORT */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">Orders Management</h1>
          <p className="mt-1 text-zinc-500 font-medium text-sm">Manage customer orders, addresses, and product variants.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-50 transition-all shadow-sm cursor-pointer"
        >
          <Download size={18} className="text-zinc-500" /> Export CSV
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{item.title}</p>
                <h2 className="mt-2 text-3xl font-black text-zinc-900">{item.value}</h2>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.light}`}>
                <item.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-4 lg:flex-row bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Customer Name, Phone, or Email..."
            className="w-full rounded-2xl bg-zinc-50 py-3.5 pl-12 pr-4 outline-none border border-transparent focus:border-zinc-300 focus:bg-white transition-all font-medium text-sm"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="relative flex-shrink-0">
            <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-9 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 outline-none focus:border-zinc-300 focus:bg-white font-medium text-sm cursor-pointer appearance-none"
            >
              {dateOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            className="px-5 py-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 outline-none focus:border-zinc-300 focus:bg-white font-medium text-sm min-w-[160px] cursor-pointer"
          >
            {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900 text-white p-4 sm:px-6 rounded-2xl shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <CheckSquare size={20} className="text-zinc-200" />
            <span className="font-bold text-sm">{selectedOrders.length} orders selected</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatusUpdate(e.target.value);
                e.target.value = "";
              }}
              disabled={isBulkLoading}
              className="bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="">Bulk Change Status...</option>
              {statusOptions.filter(s => s.value !== 'all').map(opt => (
                <option key={opt.value} value={opt.value}>Set to {opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkLoading}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-800 uppercase tracking-wider text-xs font-bold">
            <tr>
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  checked={paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-zinc-300 text-black cursor-pointer accent-black"
                />
              </th>
              <th className="px-6 py-4">Order ID & Date</th>
              <th className="px-6 py-4">Customer & Address</th>
              <th className="px-6 py-4">Products & Variants</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
                const shortId = order._id?.slice(-8).toUpperCase();
                return (
                  <tr key={order._id} className="hover:bg-zinc-50/70 transition-colors align-top">
                    <td className="px-6 py-4 pt-6">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleSelectOrder(order._id)}
                        className="w-4 h-4 rounded border-zinc-300 text-black cursor-pointer accent-black"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900">#{shortId}</span>
                        <button onClick={() => copyToClipboard(order._id)} className="text-zinc-400 hover:text-black">
                          <Copy size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="font-bold text-zinc-900">{order.shippingAddress?.fullName || order.user?.name || "Guest"}</p>
                      <p className="text-xs text-zinc-500 flex items-start gap-1">
                        <MapPin size={13} className="mt-0.5 flex-shrink-0 text-zinc-400" />
                        <span>{order.shippingAddress?.address}, {order.shippingAddress?.city}</span>
                      </p>
                      <p className="text-xs font-semibold text-zinc-700">Phone: {order.shippingAddress?.phone || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 max-w-xs">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="bg-zinc-50 p-2 rounded-xl border border-zinc-100 text-xs space-y-0.5">
                            <p className="font-bold text-zinc-900 truncate">{item.name || item.product?.name}</p>
                            <div className="flex flex-wrap gap-x-3 text-zinc-500 font-medium">
                              <span>Qty: <strong className="text-zinc-800">{item.quantity}</strong></span>
                              {item.size && <span>Size: <strong className="text-zinc-800">{item.size}</strong></span>}
                              {item.variant && <span>Variant: <strong className="text-zinc-800">{item.variant}</strong></span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-zinc-900 whitespace-nowrap">
                      ৳ {order.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 font-bold text-zinc-700 hover:bg-black hover:text-white transition-all"
                      >
                        <Eye size={15} /> View
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <PackageX size={48} className="mx-auto text-zinc-300 mb-2 opacity-30" />
                  <p className="font-bold text-lg text-zinc-600">No orders found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4">
            <span className="text-sm text-zinc-500 font-medium">
              Page <span className="font-bold text-zinc-900">{currentPage}</span> of <span className="font-bold text-zinc-900">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE VIEW */}
      <div className="space-y-4 md:hidden">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => {
            const shortId = order._id?.slice(-8).toUpperCase();
            return (
              <div key={order._id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Order ID</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <h3 className="font-mono font-black text-zinc-900">#{shortId}</h3>
                      <button onClick={() => copyToClipboard(order._id)} className="text-zinc-400"><Copy size={12} /></button>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(order.orderStatus)}`}>
                    {order.orderStatus || "Pending"}
                  </span>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Customer & Address</p>
                    <p className="font-bold text-zinc-900 text-sm mt-0.5">{order.shippingAddress?.fullName || order.user?.name}</p>
                    <p className="text-xs text-zinc-500">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                    <p className="text-xs font-semibold text-zinc-700 mt-0.5">Phone: {order.shippingAddress?.phone}</p>
                  </div>

                  <div className="border-t border-zinc-200/60 pt-3">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Ordered Items & Variants</p>
                    <div className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-zinc-200 text-xs space-y-1">
                          <p className="font-bold text-zinc-900">{item.name}</p>
                          <div className="flex gap-3 text-zinc-500 font-medium">
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span>Size: {item.size}</span>}
                            {item.variant && <span>Variant: {item.variant}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-200/60 pt-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Total Amount</span>
                    <span className="font-black text-lg text-zinc-900">৳ {order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <Link 
                  href={`/admin/orders/${order._id}`} 
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-white font-bold text-sm shadow-sm"
                >
                  <Eye size={16} /> View Order Details
                </Link>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-zinc-200 bg-white py-16 text-center">
            <p className="font-bold text-zinc-600">No orders found</p>
          </div>
        )}
      </div>

    </div>
  );
}
