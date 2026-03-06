import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { api, Recommendation, Persona, Segment } from "../lib/api";

interface BehavioralInsightsProps {
  uploadId?: string;
}

const BehavioralInsights = ({ uploadId }: BehavioralInsightsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.getRecommendations(uploadId);

        if (response.success && response.data) {
          setRecommendations(response.data.recommendations);
          setSummary(response.data.summary);
        } else {
          setError(response.error?.message || "Failed to load recommendations");
        }
      } catch (err: any) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [uploadId]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "Medium":
        return <Target className="w-5 h-5 text-yellow-400" />;
      case "Low":
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Merchandising: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      Marketing: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      Product: "text-green-400 bg-green-500/10 border-green-500/20",
      "Customer Experience": "text-pink-400 bg-pink-500/10 border-pink-500/20",
    };
    return colors[category] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
  };

  const getTimelineIcon = (timeline: string) => {
    if (timeline === "Immediate")
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (timeline === "30 days")
      return <Clock className="w-4 h-4 text-yellow-400" />;
    return <Clock className="w-4 h-4 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Insights</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">AI Recommendations</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Actionable{" "}
          <span className="gradient-text">Business Insights</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Data-driven recommendations to optimize merchandising, marketing, and
          customer experience.
        </p>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {summary.total}
            </div>
            <div className="text-sm text-gray-400">Total Actions</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-red-500/20">
            <div className="text-3xl font-bold text-red-400 mb-1">
              {summary.high_priority}
            </div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-yellow-500/20">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {summary.medium_priority}
            </div>
            <div className="text-sm text-gray-400">Medium Priority</div>
          </div>
          <div className="glass-card rounded-xl p-4 text-center border-blue-500/20">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {summary.low_priority}
            </div>
            <div className="text-sm text-gray-400">Low Priority</div>
          </div>
        </motion.div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  #{rec.rank}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                          rec.category
                        )}`}
                      >
                        {rec.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {getTimelineIcon(rec.timeline)}
                        <span>{rec.timeline}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {rec.title}
                    </h3>
                    <p className="text-gray-400">{rec.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {getPriorityIcon(rec.priority)}
                  </div>
                </div>

                {/* Expected Impact */}
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">
                    {rec.expected_impact}
                  </span>
                </div>

                {/* Implementation Steps */}
                {rec.implementation_steps && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <div className="text-sm font-semibold text-white mb-2">
                      Implementation Steps:
                    </div>
                    <ol className="space-y-1">
                      {rec.implementation_steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Action Button */}
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm transition-all hover:scale-105 flex items-center gap-2">
                  Take Action
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Lightbulb className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-gray-400 mb-4">
            Upload your shopping data to get personalized business insights
          </p>
        </div>
      )}
    </div>
  );
};

export default BehavioralInsights;
