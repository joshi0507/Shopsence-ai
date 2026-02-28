import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Upload,
  History,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  Loader2,
  FileText,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { api, KPIData, ProductData, TrendData } from "../lib/api";

interface DashboardHomeProps {
  user: any;
  onNavigate: (tab: string) => void;
  onViewReport: (id: string) => void;
  uploadId?: string;
}

const DashboardHome = ({
  user,
  onNavigate,
  onViewReport,
  uploadId,
}: DashboardHomeProps) => {
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [charts, setCharts] = useState<{
    top_products: ProductData[];
    time_series: TrendData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [uploadsRes, kpisRes, chartsRes] = await Promise.all([
          api.getUploads(),
          api.getKPIs(uploadId),
          api.getCharts(uploadId),
        ]);

        if (uploadsRes.success && uploadsRes.data) {
          setRecentFiles(uploadsRes.data.slice(0, 3));
        }
        if (kpisRes.success && kpisRes.data) {
          setKpis(kpisRes.data);
        }
        if (chartsRes.success && chartsRes.data) {
          setCharts(chartsRes.data);
        }
      } catch (e) {
        console.error("Dashboard data fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uploadId]);

  const stats = [
    {
      label: "Total Revenue",
      value: kpis ? `$${kpis.total_revenue.toLocaleString()}` : "$0",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Units Sold",
      value: kpis ? kpis.total_units.toLocaleString() : "0",
      icon: Upload,
      color: "text-cyan-400",
    },
    {
      label: "Customer Base",
      value: kpis ? kpis.total_customers.toLocaleString() : "0",
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Avg. Order Value",
      value: kpis ? `$${kpis.avg_order_value.toLocaleString()}` : "$0",
      icon: DollarSign,
      color: "text-pink-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass p-8 sm:p-12 border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold font-heading text-white mb-4">
            Welcome back,{" "}
            <span className="gradient-text">{user?.username || "User"}</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg">
            Your analytics dashboard is ready.
            {recentFiles.length > 0
              ? ` You have ${recentFiles.length} files in your history.`
              : " Start by uploading your first dataset."}
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => onNavigate("upload")}
              className="glow-button px-6 py-3 rounded-xl font-semibold text-void flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Upload className="w-5 h-5" />
              New Upload
            </button>
            <button
              onClick={() => onNavigate("history")}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <History className="w-5 h-5" />
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Sales Performance</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 px-2 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : charts?.time_series && charts.time_series.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.time_series}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A2238",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    itemStyle={{ color: "#22D3EE" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22D3EE"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Top Products</h3>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : charts?.top_products && charts.top_products.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.top_products.slice(0, 5)}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    horizontal={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="product_name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={10}
                    width={80}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#1A2238",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="units_sold" radius={[0, 4, 4, 0]} barSize={20}>
                    {charts.top_products.slice(0, 5).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#A855F7" : "#EC4899"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No product data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions / Recent Files */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Analysis</h3>
            <button
              onClick={() => onNavigate("history")}
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : recentFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent files found.
              </div>
            ) : (
              recentFiles.map((file, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (file.status === "completed") {
                      onViewReport(file.upload_id);
                    } else {
                      onNavigate("history");
                    }
                  }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors truncate max-w-[150px] sm:max-w-[200px]">
                        {file.filename}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : file.status === "processing"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {file.status === "completed" ? "View Report" : file.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Status / Notifications */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">System Status</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              <div>
                <h4 className="text-white font-medium">AI Engine Online</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Gemini Pro 1.5 is active and processing requests at normal
                  latency.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]" />
              <div>
                <h4 className="text-white font-medium">Database Synced</h4>
                <p className="text-sm text-gray-400 mt-1">
                  MongoDB cluster is healthy.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-sm text-gray-300">
                  <span className="text-white font-medium">Pro Tip:</span>
                  Upload your transaction CSV to get product trending analysis
                  instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
