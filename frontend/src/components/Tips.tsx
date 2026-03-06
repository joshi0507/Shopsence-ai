import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Book,
  TrendingUp,
  Users,
  Upload,
  BarChart3,
  Target,
  Zap,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";

interface Tip {
  icon: React.ReactNode;
  category: string;
  title: string;
  content: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const Tips = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tips: Tip[] = [
    {
      icon: <Upload className="w-6 h-6 text-cyan-400" />,
      category: "Data Upload",
      title: "Best Time to Upload",
      content:
        "Upload your sales data in CSV format with columns: product_name, date, units_sold, price. Ensure dates are in YYYY-MM-DD format for best results.",
      difficulty: "Beginner",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      category: "Analytics",
      title: "Understanding RFM Scores",
      content:
        "RFM scores range from 1-100. Higher scores (80-100) indicate Champions and Loyal Customers. Scores below 40 indicate At-Risk or Lost customers who need re-engagement.",
      difficulty: "Intermediate",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      category: "Forecasting",
      title: "Sales Forecasting Tips",
      content:
        "For accurate forecasts, upload at least 30 days of historical data. The Prophet model works best with 90+ days of data for seasonal pattern detection.",
      difficulty: "Intermediate",
    },
    {
      icon: <Users className="w-6 h-6 text-pink-400" />,
      category: "Customers",
      title: "Customer Segmentation",
      content:
        "Use the Segments tab to identify your most valuable customers. Champions (top 20%) typically generate 60-80% of your revenue. Focus retention efforts on this group.",
      difficulty: "Advanced",
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
      category: "AI Insights",
      title: "Maximizing AI Recommendations",
      content:
        "Review AI insights weekly. The Gemini AI analyzes your data and provides actionable recommendations. Priority items marked 'High' should be addressed within 7 days.",
      difficulty: "Beginner",
    },
    {
      icon: <Target className="w-6 h-6 text-red-400" />,
      category: "Marketing",
      title: "Product Affinity Analysis",
      content:
        "Use the Affinity Network to discover which products are frequently bought together. Create bundles or cross-sell campaigns based on these insights to increase average order value.",
      difficulty: "Advanced",
    },
    {
      icon: <Book className="w-6 h-6 text-blue-400" />,
      category: "Best Practices",
      title: "Data Quality Matters",
      content:
        "Ensure your CSV data is clean: no missing values, consistent product names, and accurate dates. Poor data quality leads to inaccurate insights and forecasts.",
      difficulty: "Beginner",
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      category: "Performance",
      title: "Optimize Dashboard Load Time",
      content:
        "For faster dashboard loading, keep individual CSV files under 10MB. For larger datasets, consider splitting by quarter or product category.",
      difficulty: "Intermediate",
    },
    {
      icon: <Search className="w-6 h-6 text-indigo-400" />,
      category: "Navigation",
      title: "Quick Access Tips",
      content:
        "Use the sidebar to quickly navigate between sections. The History tab shows all your uploads with status indicators. Click any completed upload to view its analysis report.",
      difficulty: "Beginner",
    },
    {
      icon: <Filter className="w-6 h-6 text-teal-400" />,
      category: "Data Upload",
      title: "CSV Format Requirements",
      content:
        "Required columns: product_name (text), date (YYYY-MM-DD), units_sold (number), price (decimal). Optional: category (text) for enhanced segmentation.",
      difficulty: "Beginner",
    },
  ];

  const categories = ["All", "Data Upload", "Analytics", "Customers", "AI Insights", "Best Practices"];

  const filteredTips = tips.filter((tip) => {
    const matchesCategory = selectedCategory === "All" || tip.category === selectedCategory;
    const matchesSearch =
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "Intermediate":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Advanced":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading text-white mb-4">
          Tips & <span className="gradient-text">Best Practices</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Master ShopSense AI with these helpful tips, guides, and best practices.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-cyan-500 text-void"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTips.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/5 shrink-0 group-hover:bg-white/10 transition-all">
                {tip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                    {tip.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDifficultyColor(
                      tip.difficulty
                    )}`}
                  >
                    {tip.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {tip.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {tip.content}
                </p>
                <button className="mt-4 text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                  Learn More <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTips.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl border border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Tips Found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}

      {/* Quick Start Guide */}
      <div className="glass-card rounded-2xl p-8 border border-white/10 mt-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Book className="w-6 h-6 text-purple-400" />
          Quick Start Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Upload Your Data</h3>
            <p className="text-gray-400 text-sm">
              Go to Data Upload tab and upload your sales CSV file. Ensure it has the required columns: product_name, date, units_sold, price.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">View Analytics</h3>
            <p className="text-gray-400 text-sm">
              Visit the Dashboard to see real-time KPIs, charts, and AI-powered insights about your sales performance.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Explore Customers</h3>
            <p className="text-gray-400 text-sm">
              Check the Customers tab for segmentation, personas, affinity analysis, and sentiment insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tips;
