import { useEffect, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  FileText,
  Zap,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Target,
  Lightbulb,
  BarChart,
} from "lucide-react";
import Plot from "react-plotly.js";
import { api } from "../lib/api";

// Parse chart data function - moved outside component to prevent hook issues
const parseGraph = (graphData: any) => {
  try {
    if (!graphData) return null;
    // If it's already an object, use it directly; if it's a string, parse it
    if (typeof graphData === "string") {
      return JSON.parse(graphData);
    }
    return graphData;
  } catch (e) {
    console.error("Failed to parse graph:", e);
    return null;
  }
};

const PlotlyChart = memo(
  ({ plotData, note, title }: any) => {
    if (!plotData || !plotData.data) {
      return null; // Don't render empty charts
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl p-6 flex flex-col border border-white/5 hover:border-cyan-500/30 transition-all h-full"
      >
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <div className="min-h-[350px] w-full" style={{ height: "350px" }}>
          <Plot
            data={plotData.data}
            layout={{
              ...plotData.layout,
              autosize: true,
              width: undefined, // Let Plotly handle width
              height: 300, // Set explicit height
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(15,15,25,0.5)",
              font: { color: "#9ca3af", size: 11 },
              margin: { t: 30, r: 30, b: 70, l: 50 },
              showlegend: false, // Hide legend for single trace
              xaxis: {
                ...plotData.layout?.xaxis,
                gridcolor: "rgba(255,255,255,0.05)",
                tickfont: { color: "#9ca3af", size: 9 },
                color: "#9ca3af",
                tickangle: -45, // Angle labels for better fit
              },
              yaxis: {
                ...plotData.layout?.yaxis,
                gridcolor: "rgba(255,255,255,0.05)",
                tickfont: { color: "#9ca3af", size: 9 },
                color: "#9ca3af",
              },
            }}
            config={{
              displayModeBar: false,
              responsive: true,
              staticPlot: false, // Allow interactions
            }}
            style={{ width: "100%", height: "300px" }}
            useResizeHandler={true}
          />
        </div>
        {note && (
          <p className="mt-4 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-4">
            {note}
          </p>
        )}
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
      prevProps.plotData === nextProps.plotData &&
      prevProps.note === nextProps.note &&
      prevProps.title === nextProps.title
    );
  },
);

const InsightCard = ({ icon: Icon, title, items, color, colorName }: any) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass rounded-3xl p-6 border border-white/5 hover:border-cyan-500/20 transition-all"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl ${color || `bg-${colorName}-400/10`}`}>
          <Icon className={`w-6 h-6 ${color ? "" : `text-${colorName}-400`}`} />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-4">
        {Array.isArray(items) ? (
          items.map((item: string, i: number) => (
            <div key={i} className="flex gap-3 items-start group">
              <div
                className={`w-1.5 h-1.5 rounded-full ${colorName ? `bg-${colorName}-400/50` : "bg-cyan-400/50"} mt-1.5 shrink-0 group-hover:scale-125 transition-transform`}
              />
              <p className="text-gray-400 text-sm leading-relaxed">{item}</p>
            </div>
          ))
        ) : (
          <div className="flex gap-3 items-start group">
            <div
              className={`w-1.5 h-1.5 rounded-full ${colorName ? `bg-${colorName}-400/50` : "bg-cyan-400/50"} mt-1.5 shrink-0 group-hover:scale-125 transition-transform`}
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              {String(items)}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AnalysisReport = ({
  reportId,
  onBack,
  latest = false,
  setActiveTab,
  onShowChat,
}: {
  reportId?: string;
  onBack: () => void;
  latest?: boolean;
  setActiveTab?: (tab: string) => void;
  onShowChat?: () => void;
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Memoize charts to prevent re-renders - MUST be called before any early returns
  const charts = useMemo(() => {
    if (!data?.results)
      return {
        mostSelling: null,
        lowSelling: null,
        highCost: null,
        lowCost: null,
        prediction: null,
        productReport: null,
      };

    return {
      mostSelling: parseGraph(data.results.most_selling?.graph),
      lowSelling: parseGraph(data.results.low_selling?.graph),
      highCost: parseGraph(data.results.high_cost_high_sales?.graph),
      lowCost: parseGraph(data.results.low_cost_high_sales?.graph),
      prediction: parseGraph(data.results.sales_prediction?.graph),
      productReport: parseGraph(data.results.product_report?.graph),
    };
  }, [data?.results]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setErrorStatus(null);

      try {
        let targetId = reportId;

        if (latest) {
          const histRes = await api.getUploads();

          if (histRes.success && histRes.data && histRes.data.length > 0) {
            const completed = histRes.data.find(
              (u: any) => u.status === "completed",
            );
            if (completed) {
              targetId = completed.upload_id;
            } else {
              setErrorStatus(
                "No completed analysis found. Please upload and analyze data first.",
              );
              setLoading(false);
              return;
            }
          } else {
            setErrorStatus(
              "No upload history found. Please upload data first.",
            );
            setLoading(false);
            return;
          }
        }

        if (!targetId) {
          setErrorStatus("Invalid Report ID");
          setLoading(false);
          return;
        }

        const res = await api.getUpload(targetId);

        if (res.success && res.data) {
          // Check if we have analysis data (either in results or analysis field)
          const analysisData = res.data.results || (res.data as any).analysis;

          if (!analysisData) {
            setErrorStatus(
              "Analysis results not available. The upload may still be processing.",
            );
            setLoading(false);
            return;
          }

          // Store the data with analysis in results field for compatibility
          const dataWithResults = {
            ...res.data,
            results: analysisData,
          };

          setData(dataWithResults);
        } else {
          setErrorStatus(
            res.error?.message || "Failed to load report details.",
          );
        }
      } catch (error: any) {
        setErrorStatus(
          `Network error: ${error.message || "Server unavailable"}`,
        );
      } finally {
        setLoading(false);
      }
    };

    if (reportId || latest) {
      fetchReport();
    }
  }, [reportId, latest]);

  if (loading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
        <p className="text-gray-400 text-sm">Loading analysis report...</p>
      </div>
    );
  }

  if (errorStatus || !data) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          Report Unavailable
        </h3>
        <p className="text-gray-400 mb-8 max-w-md">{errorStatus}</p>
        <button
          onClick={onBack}
          className="glow-button px-6 py-2 rounded-xl text-void font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Extract AI insights
  const aiInsights =
    data.results?.ai_insights?.ai_insights || data.results?.ai_insights || {};
  const performanceAnalysis = aiInsights.performance_analysis || {};
  const marketInsights = aiInsights.market_insights || {};
  const strategicRecs = aiInsights.strategic_recommendations || {};
  const financialInsights = aiInsights.financial_insights || {};
  const executiveSummary = aiInsights.executive_summary || {};

  const SummaryItem = ({ icon: Icon, label, value, color }: any) => (
    <div className="text-center p-4 glass rounded-2xl border border-white/5">
      <div className={`p-2 rounded-lg ${color} inline-block mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">
              AI Analysis Report
            </h2>
            <p className="text-gray-400">
              {data.filename} • {new Date(data.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium">
          ✓ Analysis Complete
        </div>
      </div>

      {/* Basic Analysis Summary */}
      {data.results && (
        <div className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <BarChart className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Analysis Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SummaryItem
              icon={BarChart}
              label="Products"
              value={data.results.products || "N/A"}
              color="bg-cyan-500/20 text-cyan-400"
            />
            <SummaryItem
              icon={FileText}
              label="Rows"
              value={data.results.rows_processed || "N/A"}
              color="bg-green-500/20 text-green-400"
            />
            <SummaryItem
              icon={Sparkles}
              label="Start Date"
              value={
                data.results.date_range?.start
                  ? new Date(data.results.date_range.start).toLocaleDateString()
                  : "N/A"
              }
              color="bg-purple-500/20 text-purple-400"
            />
            <SummaryItem
              icon={Sparkles}
              label="End Date"
              value={
                data.results.date_range?.end
                  ? new Date(data.results.date_range.end).toLocaleDateString()
                  : "N/A"
              }
              color="bg-orange-500/20 text-orange-400"
            />
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {executiveSummary.summary && (
        <div className="glass-card rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Executive Summary</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-base mb-4">
            {executiveSummary.summary}
          </p>
          {executiveSummary.key_takeaways &&
            executiveSummary.key_takeaways.length > 0 && (
              <div className="mt-4 space-y-2">
                {executiveSummary.key_takeaways.map(
                  (takeaway: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="text-cyan-400 font-bold">→</span>
                      <span>{takeaway}</span>
                    </div>
                  ),
                )}
              </div>
            )}
        </div>
      )}

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <InsightCard
          icon={TrendingUp}
          title="Performance Insights"
          items={performanceAnalysis.key_insights || []}
          colorName="blue"
        />
        <InsightCard
          icon={Target}
          title="Market Opportunities"
          items={marketInsights.opportunities || marketInsights.trends || []}
          colorName="green"
        />
        <InsightCard
          icon={DollarSign}
          title="Financial Recommendations"
          items={financialInsights.revenue_optimization || []}
          colorName="yellow"
        />
        <InsightCard
          icon={Lightbulb}
          title="Strategic Actions"
          items={
            strategicRecs.immediate_actions ||
            strategicRecs.short_term_strategies ||
            []
          }
          colorName="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.mostSelling && (
          <PlotlyChart
            plotData={charts.mostSelling}
            note={data.results?.most_selling?.note}
            title="Most Selling Products (Top 10)"
          />
        )}

        {charts.lowSelling && (
          <PlotlyChart
            plotData={charts.lowSelling}
            note={data.results?.low_selling?.note}
            title="Low Selling Products (Bottom 10)"
          />
        )}

        {charts.prediction && (
          <PlotlyChart
            plotData={charts.prediction}
            note={data.results?.sales_prediction?.note}
            title="Advanced Sales Prediction (Prophet Model)"
          />
        )}

        {charts.productReport && (
          <PlotlyChart
            plotData={charts.productReport}
            note={data.results?.product_report?.note}
            title="Product Performance Report"
          />
        )}

        {charts.highCost && (
          <PlotlyChart
            plotData={charts.highCost}
            note={data.results?.high_cost_high_sales?.note}
            title="High Cost but Most Sold Products"
          />
        )}

        {charts.lowCost && (
          <PlotlyChart
            plotData={charts.lowCost}
            note={data.results?.low_cost_high_sales?.note}
            title="Low Cost but Most Sold Products"
          />
        )}

        {/* No Charts Available Message */}
        {!Object.values(charts).some((chart) => chart !== null) && (
          <div className="glass-card rounded-3xl p-8 mb-8 text-center col-span-full">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart className="w-6 h-6 text-gray-400" />
              <h3 className="text-xl font-bold text-white">
                Charts Not Available
              </h3>
            </div>
            <p className="text-gray-400 text-base">
              Detailed charts and visualizations will be available once the
              advanced analytics processing is complete. The basic analysis
              summary above shows your key metrics.
            </p>
          </div>
        )}
      </div>

      {/* Action Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-cyan-400/10">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">Need More Insights?</h4>
            <p className="text-sm text-gray-400">
              Ask AI about specific trends and recommendations
            </p>
          </div>
        </div>
        <button
          onClick={onShowChat}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-void font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2"
        >
          Start Chat <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};

export default memo(AnalysisReport);
