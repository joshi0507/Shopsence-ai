import { motion } from "framer-motion";
import { FileText, Calendar, Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../lib/api";

interface DataHistoryProps {
  onViewReport: (id: string) => void;
}

const DataHistory = ({ onViewReport }: DataHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.getUploads();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-cyan-400 w-8 h-8" />
      </div>
    );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white">
            Upload <span className="gradient-text">History</span>
          </h2>
          <p className="text-gray-400 mt-2">
            Track the status of your data processing tasks
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Refresh List
        </button>
      </div>

      <div className="grid gap-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400 glass rounded-2xl border border-white/5">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            No uploads found. Start by uploading user data!
          </div>
        ) : (
          history.map((item, index) => (
            <motion.div
              key={item.upload_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl glass border border-white/5 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      item.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "failed"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors truncate max-w-[200px] sm:max-w-md">
                      {item.filename}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-600" />
                      <span
                        className={`capitalize font-medium ${
                          item.status === "completed"
                            ? "text-green-400"
                            : item.status === "failed"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:ml-auto">
                  {item.status === "completed" && (
                    <button
                      onClick={() => onViewReport(item.upload_id)}
                      className="glow-button w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-void flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                    >
                      View Report <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DataHistory;
