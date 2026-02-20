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
} from "lucide-react";
import { api } from "../lib/api";

interface DashboardHomeProps {
  user: any;
  onNavigate: (tab: string) => void;
  onViewReport: (id: string) => void;
}

const DashboardHome = ({
  user,
  onNavigate,
  onViewReport,
}: DashboardHomeProps) => {
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.getUploadHistory();
        if (res.success && res.uploads) {
          // Get top 3 most recent
          setRecentFiles(res.uploads.slice(0, 3));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchRecent();
  }, []);

  const stats = [
    {
      label: "Total Uploads",
      value: recentFiles.length > 0 ? recentFiles.length.toString() : "0",
      icon: Upload,
      color: "text-cyan-400",
    },
    {
      label: "Analysis Runs",
      value: recentFiles
        .filter((f) => f.status === "completed")
        .length.toString(),
      icon: TrendingUp,
      color: "text-purple-400",
    },
    {
      label: "Generated Insights",
      value: "AI Ready",
      icon: Sparkles,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <h3 className="text-3xl font-bold text-white mt-1">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
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
            {loadingHistory ? (
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
