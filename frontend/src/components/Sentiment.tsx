import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Heart, Star, MessageCircle } from "lucide-react";

const WordCloud = () => {
  const words = [
    { text: "Amazing quality", size: "text-lg", color: "#FF9E6D" },
    { text: "Fast shipping", size: "text-base", color: "#FF6D6D" },
    { text: "Great value", size: "text-lg", color: "#FFB08A" },
    { text: "Highly recommend", size: "text-xl", color: "#FF9E6D" },
    { text: "Excellent product", size: "text-base", color: "#FFD0B8" },
    { text: "Love it", size: "text-sm", color: "#FF9E6D" },
    { text: "Worth every penny", size: "text-lg", color: "#FF6D6D" },
    { text: "Best purchase", size: "text-base", color: "#FFB08A" },
    { text: "Exceeded expectations", size: "text-xl", color: "#FF9E6D" },
    { text: "Perfect fit", size: "text-sm", color: "#FFD0B8" },
    { text: "Beautiful design", size: "text-base", color: "#FF9E6D" },
    { text: "Amazing service", size: "text-lg", color: "#FF6D6D" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4">
      {words.map((word, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.1 }}
          className="word-cloud-item cursor-default"
          style={{ color: word.color }}
        >
          <span className={word.size}>{word.text}</span>
        </motion.div>
      ))}
    </div>
  );
};

const SentimentGauge = () => {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gaugeRef, { once: true });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isInView) {
      const targetScore = 78;
      const duration = 2000;
      const interval = 20;
      const increment = targetScore / (duration / interval);
      const timer = setInterval(() => {
        setScore((prev) => {
          if (prev >= targetScore) {
            clearInterval(timer);
            return targetScore;
          }
          return prev + increment;
        });
      }, interval);
      return () => clearInterval(timer);
    }
  }, [isInView]);

  return (
    <div ref={gaugeRef} className="relative w-64 h-32 mx-auto">
      {/* Gauge background */}
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick, i) => {
          const angle = (180 + tick * 1.8) * (Math.PI / 180);
          const x1 = 100 + 70 * Math.cos(angle);
          const y1 = 100 + 70 * Math.sin(angle);
          const x2 = 100 + 80 * Math.cos(angle);
          const y2 = 100 + 80 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
          );
        })}

        {/* Labels */}
        <text x="25" y="115" fill="#FF6D6D" fontSize="10" textAnchor="middle">
          Negative
        </text>
        <text x="100" y="40" fill="#FF9E6D" fontSize="10" textAnchor="middle">
          Neutral
        </text>
        <text x="175" y="115" fill="#FFD0B8" fontSize="10" textAnchor="middle">
          Positive
        </text>
      </svg>

      {/* Needle */}
      <motion.div
        className="absolute bottom-0 left-1/2 w-0.5 h-20 bg-white origin-bottom"
        animate={{ rotate: -90 + (score / 100) * 180 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{ transformOrigin: "bottom center" }}
      />

      {/* Center dot */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg" />

      {/* Score display */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-4xl font-bold gradient-text">
          {Math.round(score)}%
        </div>
        <div className="text-xs text-gray-400">Positive Sentiment</div>
      </motion.div>
    </div>
  );
};

const Sentiment = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const stats = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      value: "12.5K",
      label: "Reviews Analyzed",
      color: "#FF9E6D",
    },
    {
      icon: <ThumbsUp className="w-5 h-5" />,
      value: "78%",
      label: "Positive",
      color: "#FFD0B8",
    },
    {
      icon: <ThumbsDown className="w-5 h-5" />,
      value: "8%",
      label: "Negative",
      color: "#FF6D6D",
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: "4.6",
      label: "Avg Rating",
      color: "#FF9E6D",
    },
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment gauge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Overall Sentiment Score
            </h3>
            <SentimentGauge />
          </motion.div>

          {/* Word cloud */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Top Positive Keywords
            </h3>
            <WordCloud />
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <div
                className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                style={{
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Sentiment;
