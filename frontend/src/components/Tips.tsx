import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  ShoppingBag,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../lib/api";

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  expected_impact: string;
  priority: "High" | "Medium" | "Low";
  timeline: string;
  implementation_steps: string[];
}

const TipCard = ({ tip, index }: { tip: Recommendation; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "merchandising":
      case "product":
        return <ShoppingBag className="w-5 h-5 text-cyan-400" />;
      case "marketing":
      case "customers":
        return <Users className="w-5 h-5 text-purple-400" />;
      case "sales":
      case "revenue":
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      default:
        return <Zap className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "Medium":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      default:
        return "bg-green-500/10 border-green-500/30 text-green-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`glass group rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-cyan-500/30 ${
        isExpanded ? "ring-2 ring-cyan-500/20" : ""
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
            {getCategoryIcon(tip.category)}
          </div>
          <div className="flex gap-2">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${getPriorityStyles(tip.priority)}`}
            >
              {tip.priority} Impact
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-tight">
          {tip.title}
        </h3>

        <p
          className={`text-gray-400 text-sm leading-relaxed mb-4 ${isExpanded ? "" : "line-clamp-2"}`}
        >
          {tip.description}
        </p>

        {isExpanded && tip.implementation_steps && (
          <div className="space-y-3 mb-6 animate-fade-in">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Implementation Plan
            </h4>
            {tip.implementation_steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-gray-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px]">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 uppercase">Impact:</span>
              <span className="text-white font-medium">
                {tip.expected_impact}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 uppercase">Goal:</span>
              <span className="text-white font-medium">{tip.category}</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-bold uppercase tracking-widest"
          >
            {isExpanded ? "Less" : "Steps"}
            {isExpanded ? <Maximize2 size={12} /> : <ChevronRight size={12} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Tips = ({ uploadId }: { uploadId?: string }) => {
  const [tips, setTips] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getTips(uploadId);
        if (res.success && res.data) {
          setTips(res.data);
        } else {
          setError(res.error?.message || "Failed to load growth strategies.");
        }
      } catch (e) {
        setError(
          "AI Engine is currently processing data. Try again in a moment.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [uploadId]);

  const categories = ["All", ...new Set(tips.map((t) => t.category))];
  const filteredTips =
    activeFilter === "All"
      ? tips
      : tips.filter((t) => t.category === activeFilter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="text-gray-400 font-medium">Generating AI Playbooks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in py-6">
      {/* Header section */}
      <div className="relative rounded-3xl overflow-hidden glass p-10 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full blur-[80px] -ml-30 -mb-30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold mb-4 tracking-widest uppercase">
              <Sparkles size={12} />
              AI GROWTH ENGINE
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
              Action <span className="gradient-text">Playbooks</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Synthesized growth strategies derived from your behavioral and
              transaction data. Implement these high-impact actions to optimize
              your sales funnel.
            </p>
          </div>

          <div className="flex flex-col gap-4 min-w-[200px]">
            <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-4 bg-white/5 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Target size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {tips.length}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  New insights
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="glow-button w-full px-6 py-4 rounded-xl font-bold text-void transition-all hover:scale-[1.02] active:scale-95 text-xs tracking-widest uppercase"
            >
              Recalculate
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-red-500/20 bg-red-500/5">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 italic">
            Intelligence Gap
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-2 mx-auto transition-colors"
          >
            Retry Generation <ArrowRight size={16} />
          </button>
        </div>
      ) : tips.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/5 bg-white/2">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No data uploaded yet
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Upload your sales data to generate actionable AI-powered business
            tips and growth strategies.
          </p>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                    activeFilter === cat
                      ? "bg-cyan-500 text-void shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative group flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Search tactics..."
                className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all w-64 uppercase tracking-widest font-medium placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTips.map((tip, idx) => (
              <TipCard key={tip.id} tip={tip} index={idx} />
            ))}

            {/* Empty Context Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-cyan-500/5 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-6 group-hover:scale-110 transition-transform group-hover:bg-cyan-500/10 group-hover:text-cyan-400">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-white font-bold mb-3">
                Deeper Intelligence?
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-[200px] leading-relaxed">
                Connect your real-time inventory API for more granular stock
                recommendations.
              </p>
              <button className="text-[10px] uppercase tracking-widest font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 px-4 py-2 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50">
                Upgrade Engine <ArrowRight size={12} />
              </button>
            </motion.div>
          </div>

          {/* Callout */}
          <div className="glass-card rounded-2xl p-8 border border-cyan-500/10 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 flex flex-col md:flex-row items-center gap-8 shadow-inner">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 rotate-3 shadow-lg shadow-cyan-500/10">
              <Zap size={32} />
            </div>
            <div className="text-left">
              <h4 className="text-cyan-400 font-bold mb-2 tracking-widest uppercase text-xs">
                AI Recommendation Priority
              </h4>
              <p className="text-gray-300 text-base leading-relaxed">
                Focus on{" "}
                <span className="text-white font-bold underline decoration-cyan-500/50 underline-offset-4 decoration-2">
                  High Impact
                </span>{" "}
                strategies first. Our simulation predicts a baseline{" "}
                <span className="text-green-400 font-bold">
                  12.4% revenue lift
                </span>{" "}
                within 30 days of implementing the top 3 playbooks in the
                marketing category.
              </p>
            </div>
            <button className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-white text-xs font-bold tracking-widest uppercase border border-white/10 transition-all whitespace-nowrap">
              Schedule Review
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Tips;
