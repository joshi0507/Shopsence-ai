import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users,
  Network,
  MessageSquare,
  Brain,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}

const FeatureCard = ({
  icon,
  title,
  description,
  color,
  delay,
}: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("rotateX(0) rotateY(0)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTransformStyle(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("rotateX(0) rotateY(0)");
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-card"
    >
      <motion.div
        className="glass-card-hover h-full p-6 rounded-2xl cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: transformStyle,
        }}
      >
        <div className="relative z-10">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}40)`,
              border: `1px solid ${color}30`,
              boxShadow: `0 0 30px ${color}20`,
            }}
          >
            <div style={{ color }}>{icon}</div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold font-heading text-white mb-3">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 leading-relaxed mb-4">{description}</p>

          {/* Learn more link */}
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
            style={{ color }}
          >
            Learn more
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Glow effect */}
        <div
          className="absolute -inset-px rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}10, transparent 40%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: <Users className="w-7 h-7" />,
      title: "Customer Segmentation",
      description:
        "Automatically cluster your customers based on behavior, preferences, and purchase patterns. Discover high-value segments and target them with precision.",
      color: "#FF9E6D",
      delay: 0.1,
    },
    {
      icon: <Network className="w-7 h-7" />,
      title: "Product Affinity Mapping",
      description:
        "Visualize how products relate to each other. Identify cross-sell opportunities and optimize your catalog for maximum revenue per customer.",
      color: "#FF6D6D",
      delay: 0.2,
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      title: "Review Sentiment Analysis",
      description:
        "Process thousands of reviews in real-time. Understand what customers truly feel about your products and brand with AI-powered sentiment scoring.",
      color: "#FF9E6D",
      delay: 0.3,
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "AI Insights Engine",
      description:
        "Get actionable recommendations powered by machine learning. Predict churn, optimize pricing, and personalize experiences at scale.",
      color: "#FF6D6D",
      delay: 0.4,
    },
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FF6D6D]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#FF9E6D]/10 rounded-full blur-3xl" />
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
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Powerful Features</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Understand</span> Your Customers
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Leverage the power of AI to uncover deep customer insights, predict
            behavior, and deliver personalized experiences that drive growth.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
