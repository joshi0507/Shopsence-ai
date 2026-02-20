import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = ({
  onOpenAuth,
}: {
  onOpenAuth: (type: "login" | "signup") => void;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#FF6D6D]/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl">
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-border" />
          </div>

          {/* Glow effects */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#FF9E6D]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#FF6D6D]/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#FF9E6D]" />
              <span className="text-sm text-gray-300">Start Free Trial</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-4">
              Ready to <span className="gradient-text">Transform</span> Your
              Analytics?
            </h2>

            <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of e-commerce businesses using ShopSense AI to
              understand their customers better and drive growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenAuth("signup")}
                className="glow-button px-8 py-4 rounded-xl text-base font-semibold text-[#1A2238] pulse-glow flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl text-base font-semibold text-white glass border border-white/10"
              >
                Schedule Demo
              </motion.button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              No credit card required. Start with a 14-day free trial.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF9E6D] to-[#FF6D6D] opacity-50" />
          <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF6D6D] to-[#FF9E6D] opacity-30" />
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
