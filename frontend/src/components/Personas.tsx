import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Clock,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api, Persona } from "../lib/api";

interface PersonasProps {
  uploadId?: string;
}

interface PersonaBehavior {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface ExtendedPersona extends Persona {
  behaviors: PersonaBehavior[];
}

const PersonaCard = ({
  persona,
  index,
}: {
  persona: ExtendedPersona;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  // Map API behavior to UI behaviors if not already present
  const displayBehaviors = persona.behaviors || [
    {
      icon: <ShoppingBag size={14} />,
      label: "Avg. Order",
      value: `$${persona.behavior.avg_order_value.toFixed(2)}`,
    },
    {
      icon: <Clock size={14} />,
      label: "Purchase Freq.",
      value: persona.behavior.purchase_frequency,
    },
    {
      icon: <Star size={14} />,
      label: "RFM Score",
      value: persona.behavior.avg_rfm_score.toString(),
    },
  ];

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
                {persona.avatar_initials}
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
              {displayBehaviors.map((behavior, i) => (
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

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Customers</span>
            <span className="text-white font-semibold">
              {persona.behavior.total_customers}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Avg Order</span>
            <span className="text-white font-semibold">
              ${persona.behavior.avg_order_value.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Revenue</span>
            <span className="text-white font-semibold">
              $
              {persona.behavior.total_revenue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>

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

const DEMO_PERSONAS: ExtendedPersona[] = [
  {
    persona_id: "demo-1",
    name: "Sarah the Explorer",
    role: "Trend-Seeker",
    description:
      "Loves discovering new products and is always first to try the latest trends. High engagement, moderate spend.",
    avatar_initials: "SE",
    color: "#FF9E6D",
    demographics: { age_range: "25-34", gender: "Female", location: "Urban" },
    behavior: {
      total_customers: 1240,
      avg_order_value: 87.5,
      purchase_frequency: "Weekly",
      avg_rfm_score: 82,
      total_revenue: 108500,
    },
    preferences: {
      top_categories: ["Clothing", "Accessories"],
      preferred_payment: "Credit Card",
      discount_sensitivity: "Low",
    },
    behaviors: [
      { icon: <ShoppingBag size={14} />, label: "Avg. Order", value: "$87.50" },
      { icon: <Clock size={14} />, label: "Purchase Freq.", value: "Weekly" },
      { icon: <Star size={14} />, label: "RFM Score", value: "82" },
    ],
  },
  {
    persona_id: "demo-2",
    name: "Mark the Loyalist",
    role: "Brand Advocate",
    description:
      "Returns consistently, refers friends, and responds well to loyalty programs. Your most valuable customer.",
    avatar_initials: "ML",
    color: "#FF6D6D",
    demographics: { age_range: "35-44", gender: "Male", location: "Suburban" },
    behavior: {
      total_customers: 876,
      avg_order_value: 142.0,
      purchase_frequency: "Bi-weekly",
      avg_rfm_score: 95,
      total_revenue: 224400,
    },
    preferences: {
      top_categories: ["Electronics", "Home"],
      preferred_payment: "PayPal",
      discount_sensitivity: "Very Low",
    },
    behaviors: [
      {
        icon: <ShoppingBag size={14} />,
        label: "Avg. Order",
        value: "$142.00",
      },
      {
        icon: <Clock size={14} />,
        label: "Purchase Freq.",
        value: "Bi-weekly",
      },
      { icon: <Star size={14} />, label: "RFM Score", value: "95" },
    ],
  },
  {
    persona_id: "demo-3",
    name: "Priya the Bargain Hunter",
    role: "Deal-Driven Shopper",
    description:
      "Highly price-sensitive, shops during sales. High volume buyer when discounts are available.",
    avatar_initials: "PB",
    color: "#FFD0B8",
    demographics: { age_range: "18-24", gender: "Female", location: "Urban" },
    behavior: {
      total_customers: 2150,
      avg_order_value: 38.9,
      purchase_frequency: "Monthly",
      avg_rfm_score: 61,
      total_revenue: 167800,
    },
    preferences: {
      top_categories: ["Clothing", "Footwear"],
      preferred_payment: "Debit Card",
      discount_sensitivity: "Very High",
    },
    behaviors: [
      { icon: <ShoppingBag size={14} />, label: "Avg. Order", value: "$38.90" },
      { icon: <Clock size={14} />, label: "Purchase Freq.", value: "Monthly" },
      { icon: <Star size={14} />, label: "RFM Score", value: "61" },
    ],
  },
  {
    persona_id: "demo-4",
    name: "David the Researcher",
    role: "Considered Buyer",
    description:
      "Takes time to evaluate before purchasing. High average order value, reads reviews carefully before committing.",
    avatar_initials: "DR",
    color: "#A78BFA",
    demographics: { age_range: "45-54", gender: "Male", location: "Suburban" },
    behavior: {
      total_customers: 640,
      avg_order_value: 218.5,
      purchase_frequency: "Quarterly",
      avg_rfm_score: 74,
      total_revenue: 279680,
    },
    preferences: {
      top_categories: ["Electronics", "Sports"],
      preferred_payment: "Credit Card",
      discount_sensitivity: "Medium",
    },
    behaviors: [
      {
        icon: <ShoppingBag size={14} />,
        label: "Avg. Order",
        value: "$218.50",
      },
      {
        icon: <Clock size={14} />,
        label: "Purchase Freq.",
        value: "Quarterly",
      },
      { icon: <Star size={14} />, label: "RFM Score", value: "74" },
    ],
  },
];

const Personas = ({ uploadId }: PersonasProps) => {
  const [personas, setPersonas] = useState<ExtendedPersona[]>(DEMO_PERSONAS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchPersonas = async () => {
      if (!uploadId) return;

      setLoading(true);
      setError(null);
      try {
        const res = await api.getPersonas(uploadId);
        if (res.success && res.data) {
          // The API returns { personas: Persona[], total_personas: number }
          const personasData = (res.data as any).personas || res.data;
          setPersonas(personasData as ExtendedPersona[]);
        } else {
          setError(res.error?.message || "Failed to load personas");
        }
      } catch (e) {
        console.error("Personas fetch error:", e);
        setError("Failed to fetch data from API");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, [uploadId]);

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

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
            <p className="text-gray-400">Discovering customer patterns...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 glass rounded-2xl border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <PersonaCard
                key={persona.persona_id}
                persona={persona}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Personas;
