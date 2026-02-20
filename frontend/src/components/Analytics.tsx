import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, BarChart3, Activity, Zap } from "lucide-react";

const AnimatedBar = ({
  value,
  delay,
  label,
}: {
  value: number;
  delay: number;
  label: string;
}) => {
  const [height, setHeight] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(barRef, { once: true });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setHeight(value), delay * 100);
    }
  }, [isInView, value, delay]);

  return (
    <div ref={barRef} className="flex flex-col items-center gap-3">
      <div className="h-48 flex items-end gap-2">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 1, delay: delay * 0.2, ease: "easeOut" }}
          className="w-8 md:w-12 rounded-t-lg relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #FF9E6D 0%, #FF6D6D 100%)",
            boxShadow: "0 0 20px rgba(255, 158, 109, 0.3)",
          }}
        >
          <div className="absolute inset-0 shimmer" />
        </motion.div>
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};

const AnimatedLineChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(svgRef, { once: true });

  const points = [
    { x: 0, y: 80 },
    { x: 20, y: 60 },
    { x: 40, y: 70 },
    { x: 60, y: 40 },
    { x: 80, y: 50 },
    { x: 100, y: 20 },
  ];

  const pathData = `M ${points.map((p) => `${p.x},${100 - p.y}`).join(" L ")}`;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      {[20, 40, 60, 80].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="100"
          y2={y}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
      ))}

      {/* Gradient fill */}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF9E6D" />
          <stop offset="100%" stopColor="#FF6D6D" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF9E6D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF9E6D" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <motion.path
        d={`${pathData} L 100,100 L 0,100 Z`}
        fill="url(#areaGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* Line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ strokeDasharray: 200, strokeDashoffset: 200 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Points */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={100 - point.y}
          r="2"
          fill="#FF9E6D"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
        />
      ))}
    </svg>
  );
};

const HeatmapCell = ({
  value,
  row,
  col,
}: {
  value: number;
  row: number;
  col: number;
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cellRef, { once: true });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setOpacity(value), (row * 5 + col) * 50);
    }
  }, [isInView, value, row, col]);

  const getColor = () => {
    if (value < 0.25) return "#FF6D6D";
    if (value < 0.5) return "#FF9E6D";
    if (value < 0.75) return "#FFB08A";
    return "#FFD0B8";
  };

  return (
    <div
      ref={cellRef}
      className="w-6 h-6 md:w-8 md:h-8 rounded-sm"
      style={{
        backgroundColor: getColor(),
        opacity,
        transition: "opacity 0.5s ease",
        boxShadow: `0 0 ${value * 10}px ${getColor()}`,
      }}
    />
  );
};

const Analytics = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const heatmapData = [
    [0.9, 0.7, 0.3, 0.2, 0.1],
    [0.8, 0.6, 0.4, 0.3, 0.2],
    [0.5, 0.8, 0.7, 0.4, 0.3],
    [0.3, 0.5, 0.9, 0.8, 0.5],
    [0.1, 0.2, 0.6, 0.9, 0.8],
  ];

  const barData = [
    { value: 85, label: "Jan" },
    { value: 72, label: "Feb" },
    { value: 90, label: "Mar" },
    { value: 65, label: "Apr" },
    { value: 95, label: "May" },
    { value: 78, label: "Jun" },
  ];

  return (
    <section
      id="analytics"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF9E6D]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF6D6D]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Activity className="w-4 h-4 text-[#FF6D6D]" />
            <span className="text-sm text-gray-300">Live Analytics</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Visualize Your <span className="gradient-text">Data</span> Like
            Never Before
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Beautiful, interactive charts that update in real-time. See patterns
            emerge as data flows in and get actionable insights instantly.
          </p>
        </motion.div>

        {/* Analytics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bar Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
                <p className="text-sm text-gray-400">Monthly performance</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FF6D6D]/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#FF6D6D]" />
              </div>
            </div>
            <div className="flex justify-between items-end h-48">
              {barData.map((item, i) => (
                <AnimatedBar
                  key={item.label}
                  value={item.value}
                  delay={i}
                  label={item.label}
                />
              ))}
            </div>
          </motion.div>

          {/* Line Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  User Engagement
                </h3>
                <p className="text-sm text-gray-400">Session duration trend</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FF9E6D]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#FF9E6D]" />
              </div>
            </div>
            <div className="h-48">
              <AnimatedLineChart />
            </div>
          </motion.div>

          {/* Heatmap Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Purchase Heatmap
                </h3>
                <p className="text-sm text-gray-400">Hour vs Day analysis</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FF6D6D]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#FF6D6D]" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {heatmapData.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <HeatmapCell
                    key={`${rowIndex}-${colIndex}`}
                    value={value}
                    row={rowIndex}
                    col={colIndex}
                  />
                )),
              )}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;
