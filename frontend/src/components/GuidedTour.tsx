import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  Lightbulb,
  FileText,
  Home,
} from "lucide-react";

interface GuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  icon: React.ElementType;
  position: "center" | "bottom";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    target: "welcome",
    title: "Welcome to Your Dashboard",
    content:
      "This is your command center for all analytics. Let us show you around!",
    icon: Home,
    position: "center",
  },
  {
    id: "upload",
    target: "sidebar-upload",
    title: "Upload Your Data",
    content:
      "Start by uploading your CSV or Excel files. Our AI will analyze them instantly.",
    icon: Upload,
    position: "bottom",
  },
  {
    id: "history",
    target: "sidebar-history",
    title: "Analysis History",
    content:
      "Access all your previous analyses, reports, and generated insights in one place.",
    icon: FileText,
    position: "bottom",
  },
  {
    id: "insights",
    target: "sidebar-analysis",
    title: "AI-Powered Insights",
    content:
      "Get deep insights with sentiment analysis, customer personas, and trend forecasting.",
    icon: BarChart3,
    position: "bottom",
  },
  {
    id: "customers",
    target: "sidebar-customers",
    title: "Customer Segments",
    content:
      "Discover distinct customer groups and their behaviors using advanced clustering.",
    icon: Users,
    position: "bottom",
  },
  {
    id: "tips",
    target: "sidebar-tips",
    title: "Pro Tips",
    content:
      "Get personalized recommendations and optimization tips for your business.",
    icon: Lightbulb,
    position: "bottom",
  },
  {
    id: "settings",
    target: "sidebar-account",
    title: "Account Settings",
    content: "Manage your profile, preferences, and API configurations.",
    icon: Settings,
    position: "bottom",
  },
  {
    id: "complete",
    target: "complete",
    title: "You're All Set!",
    content:
      "You're ready to start analyzing! Remember, you can always restart this tour from settings.",
    icon: Sparkles,
    position: "center",
  },
];

const GuidedTour = ({ onComplete, onSkip }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isVisible, setIsVisible] = useState(true);
  const stepRef = useRef<HTMLDivElement>(null);

  const step = tourSteps[currentStep];
  const isCenter = step.position === "center";
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  // Find and highlight target element
  useEffect(() => {
    if (isCenter) {
      setHighlightPosition({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }

    const targetEl = document.querySelector(`[data-tour="${step.target}"]`);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [currentStep, isCenter, step.target]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (isLast) {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  // Progress calculation
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Spotlight Overlay */}
          {!isCenter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at ${highlightPosition.left + highlightPosition.width / 2}px ${highlightPosition.top + highlightPosition.height / 2}px, transparent ${Math.max(highlightPosition.width, highlightPosition.height) * 0.6}px, rgba(0, 0, 0, 0.7) ${Math.max(highlightPosition.width, highlightPosition.height) * 0.7 + 20}px)
                `,
              }}
            />
          )}

          {/* Tour Card */}
          <motion.div
            ref={stepRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: isMinimized ? 0.8 : 1,
              y: 0,
              ...(isCenter
                ? {}
                : {
                    top: highlightPosition.top + highlightPosition.height + 20,
                    left: Math.max(
                      20,
                      Math.min(
                        highlightPosition.left - 20,
                        window.innerWidth - 380,
                      ),
                    ),
                  }),
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-[70] w-full max-w-md ${isCenter ? "mx-4" : ""}`}
            style={
              !isCenter
                ? {
                    maxWidth: 360,
                  }
                : {}
            }
          >
            <div
              className={`glass-card rounded-2xl overflow-hidden border border-white/20 shadow-2xl ${isCenter ? "mx-auto" : ""}`}
            >
              {/* Header */}
              <div className="relative px-5 py-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                      <step.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">
                        Step {currentStep + 1} of {tourSteps.length}
                      </p>
                      <h3 className="text-white font-semibold text-sm">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {step.content}
                </p>

                {/* Features List for Welcome Step */}
                {step.id === "welcome" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      { icon: Upload, text: "Upload Data" },
                      { icon: BarChart3, text: "View Analysis" },
                      { icon: Users, text: "Customers" },
                      { icon: Settings, text: "Settings" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-gray-400 text-xs"
                      >
                        <item.icon className="w-3 h-3" />
                        {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 bg-white/5 flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Skip tour
                </button>

                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <button
                      onClick={handlePrev}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${
                      isLast
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    }`}
                  >
                    {isLast ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-1.5 pb-4">
                {tourSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`transition-all ${
                      i === currentStep
                        ? "w-6 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        : "w-1.5 h-1.5 rounded-full bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Minimized Toggle */}
          {!isCenter && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsMinimized(!isMinimized)}
              className="fixed bottom-6 left-6 z-[70] p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl shadow-lg shadow-cyan-500/30"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.button>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default GuidedTour;
