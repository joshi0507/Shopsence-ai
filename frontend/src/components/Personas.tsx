import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { User, ShoppingBag, Clock, Star, ChevronRight } from "lucide-react";

interface Persona {
  id: number;
  name: string;
  role: string;
  avatar: string;
  description: string;
  behaviors: { icon: React.ReactNode; label: string; value: string }[];
  color: string;
}

const PersonaCard = ({
  persona,
  index,
}: {
  persona: Persona;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="glass-card rounded-2xl p-6 cursor-pointer overflow-hidden"
        animate={{
          scale: isHovered ? 1.02 : 1,
          borderColor: isHovered
            ? `${persona.color}50`
            : "rgba(255,255,255,0.1)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: isHovered ? "200%" : "-200%" }}
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* Avatar */}
        <div className="relative mb-4">
          <div
            className="w-20 h-20 rounded-full p-1"
            style={{
              background: `linear-gradient(135deg, ${persona.color}, ${persona.color}80)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-void flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {persona.name[0]}
              </span>
            </div>
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: persona.color }}
          >
            <ShoppingBag className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Info */}
        <h3 className="text-lg font-bold text-white mb-1">{persona.name}</h3>
        <p className="text-sm text-gray-400 mb-3">{persona.role}</p>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {persona.description}
        </p>

        {/* Behavior metrics - shown on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {persona.behaviors.map((behavior, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    <span style={{ color: persona.color }}>
                      {behavior.icon}
                    </span>
                    <span>{behavior.label}</span>
                  </div>
                  <span className="font-mono" style={{ color: persona.color }}>
                    {behavior.value}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View details link */}
        <motion.div
          className="flex items-center gap-1 mt-4 text-sm font-medium"
          style={{ color: persona.color }}
          animate={{ x: isHovered ? 5 : 0 }}
        >
          <span>View details</span>
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const Personas = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const personas: Persona[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Fashion Enthusiast",
      avatar: "SC",
      description:
        "Premium shopper who values unique, statement pieces. Highly responsive to limited editions and exclusive drops.",
      behaviors: [
        { icon: <ShoppingBag size={14} />, label: "Avg. Order", value: "$342" },
        { icon: <Clock size={14} />, label: "Purchase Freq.", value: "2.4/mo" },
        { icon: <Star size={14} />, label: "Loyalty Score", value: "94%" },
      ],
      color: "#00F0FF",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      role: "Value Hunter",
      avatar: "MJ",
      description:
        "Price-conscious buyer who researches thoroughly before purchasing. Responds well to discounts and bundles.",
      behaviors: [
        { icon: <ShoppingBag size={14} />, label: "Avg. Order", value: "$127" },
        { icon: <Clock size={14} />, label: "Purchase Freq.", value: "1.8/mo" },
        { icon: <Star size={14} />, label: "Loyalty Score", value: "78%" },
      ],
      color: "#7000FF",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Trend Setter",
      avatar: "ER",
      description:
        "Early adopter who actively shares reviews and influences her network. High social media engagement.",
      behaviors: [
        { icon: <ShoppingBag size={14} />, label: "Avg. Order", value: "$289" },
        { icon: <Clock size={14} />, label: "Purchase Freq.", value: "3.2/mo" },
        { icon: <Star size={14} />, label: "Loyalty Score", value: "91%" },
      ],
      color: "#FF00AA",
    },
    {
      id: 4,
      name: "David Kim",
      role: "Tech Savvy",
      avatar: "DK",
      description:
        "Research-driven purchaser focused on specifications and reviews. Values detailed product information.",
      behaviors: [
        { icon: <ShoppingBag size={14} />, label: "Avg. Order", value: "$456" },
        { icon: <Clock size={14} />, label: "Purchase Freq.", value: "1.5/mo" },
        { icon: <Star size={14} />, label: "Loyalty Score", value: "85%" },
      ],
      color: "#0066FF",
    },
  ];

  return (
    <section
      id="personas"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
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
            <User className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-gray-300">Customer Personas</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Meet Your <span className="gradient-text">Ideal Customers</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            AI-powered persona discovery that goes beyond demographics.
            Understand behavior patterns, preferences, and purchase drivers.
          </p>
        </motion.div>

        {/* Persona cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, index) => (
            <PersonaCard key={persona.id} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Personas;
