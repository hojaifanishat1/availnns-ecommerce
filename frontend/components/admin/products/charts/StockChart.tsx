"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Package,
} from "lucide-react";

interface StockDataPoint {
  date: string;
  stock: number;
  [key: string]: unknown;
}

interface Props {
  data: StockDataPoint[];
}

export default function StockChart({
  data = []
}: Props) {
  return (
    <div
      className="
        border
        border-gray-200
        rounded-2xl
        p-6
        bg-white
        shadow-sm
        space-y-6
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3
              className="
                font-semibold
                text-lg
                text-gray-900
              "
            >
              Stock History Trend
            </h3>
            <p className="text-xs text-gray-500">Visualizing inventory fluctuations over time.</p>
          </div>
        </div>
      </div>

      {
        !data || data.length === 0 ? (
          <div className="h-72 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Package size={24} />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-gray-900">No chart data available</p>
              <p className="text-xs text-gray-500">Stock history will be plotted here once updates are recorded.</p>
            </div>
          </div>
        ) : (
          <div
            className="
              h-72
              w-full
            "
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    color: '#0f172a'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#000000', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      }
    </div>
  );
}
