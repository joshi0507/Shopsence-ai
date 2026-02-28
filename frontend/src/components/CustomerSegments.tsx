import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  AlertCircle,
  ChevronRight,
  Download,
} from "lucide-react";
import { api, Segment } from "../lib/api";
import Plot from "react-plotly.js";

interface CustomerSegmentsProps {
  uploadId?: string;
  onViewCustomers?: (segmentId: number) => void;
}

const CustomerSegments = ({
  uploadId,
  onViewCustomers,
}: CustomerSegmentsProps) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentMapping, setSegmentMapping] = useState<Record<number, string>>(
    {},
  );
  const [visualization, setVisualization] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchSegments = async () => {
      if (!uploadId) return;

      setLoading(true);
      setError(null);
      try {
        const res = await api.getBehaviorSegments(uploadId);
        if (res.success && res.data) {
          // The API returns { segments: Segment[], ... }
          const segmentsData = (res.data as any).segments || res.data;
          setSegments(segmentsData as Segment[]);
          setVisualization((res.data as any).visualization);
        } else {
          setError(res.error?.message || "Failed to load segments");
        }
      } catch (e) {
        console.error("Segments fetch error:", e);
        setError("Failed to fetch data from API");
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, [uploadId]);

  const getPriorityColor = (segmentName: string) => {
    const colors: Record<string, string> = {
      Champions: "from-cyan-500 to-blue-500",
      "Loyal Customers": "from-purple-500 to-pink-500",
      "Big Spenders": "from-yellow-500 to-orange-500",
      "At Risk": "from-red-500 to-pink-500",
      "Value Seekers": "from-green-500 to-emerald-500",
      "New Customers": "from-blue-500 to-indigo-500",
    };
    return colors[segmentName] || "from-gray-500 to-slate-500";
  };

  const getSegmentIcon = (segmentName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Champions: <Target className="w-5 h-5" />,
      "Loyal Customers": <Users className="w-5 h-5" />,
      "Big Spenders": <DollarSign className="w-5 h-5" />,
      "At Risk": <AlertCircle className="w-5 h-5" />,
      "Value Seekers": <TrendingUp className="w-5 h-5" />,
      "New Customers": <Clock className="w-5 h-5" />,
    };
    return icons[segmentName] || <Users className="w-5 h-5" />;
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
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          Error Loading Segments
        </h3>
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
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-gray-300">Customer Segmentation</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Discover Your <span className="gradient-text">Customer Segments</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          AI-powered RFM analysis reveals distinct customer groups based on
          behavior, value, and engagement patterns.
        </p>
      </motion.div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.segment_id}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPriorityColor(
                  segment.segment_name,
                )} flex items-center justify-center text-white`}
              >
                {getSegmentIcon(segment.segment_name)}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {segment.customer_count}
                </div>
                <div className="text-xs text-gray-400">customers</div>
              </div>
            </div>

            {/* Segment Name */}
            <h3 className="text-xl font-bold text-white mb-2">
              {segment.segment_name}
            </h3>
            <div className="text-sm text-gray-400 mb-4">
              {segment.size_percentage.toFixed(1)}% of total customers
            </div>

            {/* Metrics */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Avg Order Value</span>
                <span className="text-white font-semibold">
                  ${segment.avg_order_value.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Revenue</span>
                <span className="text-white font-semibold">
                  $
                  {segment.total_revenue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Avg Recency</span>
                <span className="text-white font-semibold">
                  {segment.characteristics.avg_recency.toFixed(0)} days
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Avg Frequency</span>
                <span className="text-white font-semibold">
                  {segment.characteristics.avg_frequency.toFixed(1)}
                </span>
              </div>
            </div>

            {/* RFM Score Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">RFM Score</span>
                <span className="text-white font-semibold">
                  {segment.characteristics.avg_rfm_score.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getPriorityColor(
                    segment.segment_name,
                  )}`}
                  style={{
                    width: `${Math.min(
                      (segment.characteristics.avg_rfm_score / 555) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* View Details */}
            <button
              onClick={() => onViewCustomers?.(segment.segment_id)}
              className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              View Customers
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Visualization */}
      {visualization && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">
            Segment Distribution
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <Plot
                data={[
                  {
                    type: "pie",
                    labels: visualization.labels,
                    values: visualization.values,
                    marker: {
                      colors: visualization.colors,
                    },
                    hole: 0.4,
                    textinfo: "label+percent",
                    hoverinfo: "label+value+percent",
                  },
                ]}
                layout={{
                  autosize: true,
                  height: 300,
                  paper_bgcolor: "rgba(0,0,0,0)",
                  plot_bgcolor: "rgba(0,0,0,0)",
                  margin: { t: 20, b: 20, l: 20, r: 20 },
                  showlegend: true,
                  legend: {
                    orientation: "h",
                    y: -0.1,
                    font: { color: "#94A3B8" },
                  },
                }}
                config={{
                  responsive: true,
                  displayModeBar: false,
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            {/* Revenue Bar Chart */}
            <div>
              <Plot
                data={[
                  {
                    type: "bar",
                    x: visualization.labels,
                    y: visualization.revenues,
                    marker: {
                      color: visualization.colors,
                    },
                    text: visualization.revenues.map(
                      (v) => `$${(v / 1000).toFixed(1)}K`,
                    ),
                    textposition: "outside",
                  },
                ]}
                layout={{
                  autosize: true,
                  height: 300,
                  paper_bgcolor: "rgba(0,0,0,0)",
                  plot_bgcolor: "rgba(0,0,0,0)",
                  margin: { t: 40, b: 60, l: 60, r: 20 },
                  xaxis: {
                    tickangle: -45,
                    color: "#94A3B8",
                  },
                  yaxis: {
                    title: "Revenue ($)",
                    color: "#94A3B8",
                  },
                }}
                config={{
                  responsive: true,
                  displayModeBar: false,
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          Segmentation Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {segments.find((s) => s.segment_name === "Champions")
                ?.customer_count || 0}
            </div>
            <div className="text-sm text-gray-400">Champion Customers</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {segments.find((s) => s.segment_name === "At Risk")
                ?.customer_count || 0}
            </div>
            <div className="text-sm text-gray-400">At-Risk Customers</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {segments.reduce((sum, s) => sum + s.customer_count, 0)}
            </div>
            <div className="text-sm text-gray-400">
              Total Customers Analyzed
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerSegments;
