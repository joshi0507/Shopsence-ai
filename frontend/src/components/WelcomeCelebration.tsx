import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  PartyPopper,
  X,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

interface WelcomeCelebrationProps {
  user: any;
  onComplete: () => void;
}

const WelcomeCelebration = ({ user, onComplete }: WelcomeCelebrationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([]);
  const [currentPhase, setCurrentPhase] = useState(0);

  const colors = ["#FF9E6D", "#FF6D6D", "#00F5FF", "#A855F7", "#22D3EE"];

  // Generate celebration particles
  useEffect(() => {
    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setParticles((prev) => [...prev.slice(-20), newParticle]);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto-advance phases
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPhase < 2) {
        setCurrentPhase(currentPhase + 1);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentPhase]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      desc: "Advanced Gemini AI processing",
    },
    {
      icon: Target,
      title: "Customer Insights",
      desc: "Segmentation & personas",
    },
    {
      icon: TrendingUp,
      title: "Trend Forecasting",
      desc: "Predict future patterns",
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[#1A2238]">
            {/* Gradient Orbs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/30 to-pink-500/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-3xl"
            />

            {/* Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, y: particle.y, x: particle.x }}
                animate={{
                  opacity: 0,
                  y: 120,
                  x: particle.x + (Math.random() - 0.5) * 20,
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 10px ${particle.color}`,
                }}
              />
            ))}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Content Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative z-10 max-w-lg mx-4"
          >
            <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/20 text-center overflow-hidden">
              {/* Celebration Header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                className="relative inline-flex"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <PartyPopper className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Welcome Text */}
              <AnimatePresence mode="wait">
                {currentPhase >= 0 && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6"
                  >
                    <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading">
                      Welcome to{" "}
                      <span className="gradient-text">ShopSense AI</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                      Welcome back,{" "}
                      <span className="text-white font-semibold">
                        {user?.username || "User"}
                      </span>
                      !
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feature Highlights */}
              <AnimatePresence>
                {currentPhase >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-3"
                  >
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                          <feature.icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-white font-medium text-sm">
                            {feature.title}
                          </h3>
                          <p className="text-gray-400 text-xs">
                            {feature.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <AnimatePresence>
                {currentPhase >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="glow-button px-6 py-3 rounded-xl font-semibold text-[#1A2238] flex items-center justify-center gap-2"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold transition-colors"
                    >
                      Skip
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Skip hint */}
              {currentPhase < 2 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleClose}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Skip <ArrowRight className="w-3 h-3 inline" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeCelebration;
