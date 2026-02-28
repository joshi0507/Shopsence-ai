import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ThumbsUp, ThumbsDown, Heart, Star, MessageCircle } from "lucide-react";
import { SentimentOverview, CategorySentiment, Keyword } from "../lib/api";
import Plot from "react-plotly.js";

interface SentimentProps {
  uploadId?: string;
}

// Demo data for landing page preview
const DEMO_OVERVIEW: SentimentOverview = {
  overall_score: 74,
  average_rating: 4.2,
  total_reviews: 12840,
  distribution: { positive: 9470, neutral: 2310, negative: 1060 },
  percentages: { positive: 73.8, neutral: 18.0, negative: 8.2 },
  rating_distribution: { "1": 340, "2": 720, "3": 1590, "4": 4210, "5": 5980 },
};

const DEMO_CATEGORIES: CategorySentiment[] = [
  {
    category: "Clothing",
    sentiment_score: 78,
    avg_rating: 4.3,
    review_count: 4200,
    positive_percentage: 78,
    trend: "up",
  },
  {
    category: "Footwear",
    sentiment_score: 82,
    avg_rating: 4.5,
    review_count: 3100,
    positive_percentage: 82,
    trend: "up",
  },
  {
    category: "Accessories",
    sentiment_score: 65,
    avg_rating: 3.9,
    review_count: 2800,
    positive_percentage: 65,
    trend: "stable",
  },
  {
    category: "Electronics",
    sentiment_score: 71,
    avg_rating: 4.1,
    review_count: 1940,
    positive_percentage: 71,
    trend: "down",
  },
  {
    category: "Home & Garden",
    sentiment_score: 69,
    avg_rating: 4.0,
    review_count: 800,
    positive_percentage: 69,
    trend: "stable",
  },
];

const Sentiment = ({ uploadId }: SentimentProps) => {
  const [overview] = useState<SentimentOverview | null>(DEMO_OVERVIEW);
  const [byCategory] = useState<CategorySentiment[]>(DEMO_CATEGORIES);
  const [keywords] = useState<{
    positive_keywords: Keyword[];
    negative_keywords: Keyword[];
  } | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FF6D6D]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF9E6D]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Heart className="w-4 h-4 text-[#FF6D6D]" />
            <span className="text-sm text-gray-300">Review Analysis</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Understand What{" "}
            <span className="gradient-text">Customers Feel</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            AI-powered sentiment analysis that processes thousands of reviews in
            real-time. Understand the emotions behind every review.
          </p>
        </motion.div>

        {/* Sentiment Gauge and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sentiment Gauge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Overall Sentiment Score
            </h3>
            <div className="relative w-64 h-32 mx-auto">
              {/* Gauge SVG */}
              <svg viewBox="0 0 200 120" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="gaugeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#FF6D6D" />
                    <stop offset="50%" stopColor="#FF9E6D" />
                    <stop offset="100%" stopColor="#FFD0B8" />
                  </linearGradient>
                </defs>

                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {/* Active arc */}
                <motion.path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: overview.overall_score / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>

              {/* Score display */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="text-4xl font-bold gradient-text">
                  {overview.overall_score.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Positive Sentiment</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Sentiment Distribution
            </h3>
            <div className="space-y-4">
              {/* Positive */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="font-medium">Positive</span>
                  </div>
                  <span className="text-white font-semibold">
                    {overview.percentages.positive.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${overview.percentages.positive}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {overview.distribution.positive} reviews
                </div>
              </div>

              {/* Neutral */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star className="w-5 h-5" />
                    <span className="font-medium">Neutral</span>
                  </div>
                  <span className="text-white font-semibold">
                    {overview.percentages.neutral.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${overview.percentages.neutral}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {overview.distribution.neutral} reviews
                </div>
              </div>

              {/* Negative */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <ThumbsDown className="w-5 h-5" />
                    <span className="font-medium">Negative</span>
                  </div>
                  <span className="text-white font-semibold">
                    {overview.percentages.negative.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${overview.percentages.negative}%` }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {overview.distribution.negative} reviews
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Sentiment */}
        {byCategory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Sentiment by Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {byCategory.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">
                      {category.category}
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        category.sentiment_score >= 70
                          ? "bg-green-500/20 text-green-400"
                          : category.sentiment_score >= 50
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {category.sentiment_score.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Avg Rating: {category.avg_rating.toFixed(1)}</span>
                    <span>{category.review_count} reviews</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-[#FF9E6D]/20">
              <MessageCircle className="w-5 h-5" style={{ color: "#FF9E6D" }} />
            </div>
            <div className="text-2xl font-bold text-[#FF9E6D]">
              {overview.total_reviews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Reviews Analyzed</div>
          </div>

          <div className="glass-card rounded-xl p-4 text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-[#FFD0B8]/20">
              <ThumbsUp className="w-5 h-5" style={{ color: "#FFD0B8" }} />
            </div>
            <div className="text-2xl font-bold text-[#FFD0B8]">
              {overview.percentages.positive.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Positive</div>
          </div>

          <div className="glass-card rounded-xl p-4 text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-[#FF6D6D]/20">
              <ThumbsDown className="w-5 h-5" style={{ color: "#FF6D6D" }} />
            </div>
            <div className="text-2xl font-bold text-[#FF6D6D]">
              {overview.percentages.negative.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Negative</div>
          </div>

          <div className="glass-card rounded-xl p-4 text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-[#FF9E6D]/20">
              <Star className="w-5 h-5" style={{ color: "#FF9E6D" }} />
            </div>
            <div className="text-2xl font-bold text-[#FF9E6D]">
              {overview.average_rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Avg Rating</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Sentiment;
