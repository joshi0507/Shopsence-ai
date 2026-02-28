import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { api, AffinityNode, AffinityLink, AffinityResponse } from "../lib/api";
import Plot from "react-plotly.js";
import { Loader2, AlertCircle } from "lucide-react";

interface AffinityNetworkProps {
  uploadId?: string;
}

// Demo data for landing page preview
const DEMO_NODES: AffinityNode[] = [
  {
    id: "Sneakers",
    label: "Sneakers",
    value: 850,
    color: "#FF9E6D",
    group: "Footwear",
  },
  {
    id: "Socks",
    label: "Socks",
    value: 620,
    color: "#FF6D6D",
    group: "Accessories",
  },
  {
    id: "Shorts",
    label: "Shorts",
    value: 540,
    color: "#A78BFA",
    group: "Clothing",
  },
  {
    id: "T-Shirt",
    label: "T-Shirt",
    value: 720,
    color: "#34D399",
    group: "Clothing",
  },
  {
    id: "Cap",
    label: "Cap",
    value: 430,
    color: "#60A5FA",
    group: "Accessories",
  },
  {
    id: "Backpack",
    label: "Backpack",
    value: 390,
    color: "#F59E0B",
    group: "Accessories",
  },
  {
    id: "Jeans",
    label: "Jeans",
    value: 660,
    color: "#EC4899",
    group: "Clothing",
  },
  {
    id: "Belt",
    label: "Belt",
    value: 280,
    color: "#06B6D4",
    group: "Accessories",
  },
  {
    id: "Hoodie",
    label: "Hoodie",
    value: 580,
    color: "#8B5CF6",
    group: "Clothing",
  },
  {
    id: "Watch",
    label: "Watch",
    value: 410,
    color: "#FFD0B8",
    group: "Accessories",
  },
  {
    id: "Sandals",
    label: "Sandals",
    value: 370,
    color: "#4ADE80",
    group: "Footwear",
  },
  {
    id: "Sunglasses",
    label: "Sunglasses",
    value: 320,
    color: "#FB923C",
    group: "Accessories",
  },
];

const DEMO_LINKS: AffinityLink[] = [
  {
    source: "Sneakers",
    target: "Socks",
    value: 5,
    lift: 3.2,
    confidence: 0.78,
    support: 0.12,
  },
  {
    source: "Sneakers",
    target: "Shorts",
    value: 4,
    lift: 2.8,
    confidence: 0.65,
    support: 0.09,
  },
  {
    source: "T-Shirt",
    target: "Jeans",
    value: 5,
    lift: 4.1,
    confidence: 0.82,
    support: 0.15,
  },
  {
    source: "T-Shirt",
    target: "Cap",
    value: 3,
    lift: 2.2,
    confidence: 0.51,
    support: 0.07,
  },
  {
    source: "Jeans",
    target: "Belt",
    value: 4,
    lift: 3.7,
    confidence: 0.71,
    support: 0.11,
  },
  {
    source: "Hoodie",
    target: "Cap",
    value: 3,
    lift: 2.5,
    confidence: 0.58,
    support: 0.08,
  },
  {
    source: "Hoodie",
    target: "Backpack",
    value: 3,
    lift: 2.1,
    confidence: 0.47,
    support: 0.06,
  },
  {
    source: "Sandals",
    target: "Sunglasses",
    value: 4,
    lift: 2.9,
    confidence: 0.67,
    support: 0.1,
  },
  {
    source: "Watch",
    target: "Belt",
    value: 3,
    lift: 2.4,
    confidence: 0.55,
    support: 0.08,
  },
  {
    source: "Shorts",
    target: "T-Shirt",
    value: 4,
    lift: 3.0,
    confidence: 0.72,
    support: 0.13,
  },
];

const AffinityNetwork = ({ uploadId }: AffinityNetworkProps) => {
  const [nodes, setNodes] = useState<AffinityNode[]>(DEMO_NODES);
  const [links, setLinks] = useState<AffinityLink[]>(DEMO_LINKS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchData = async () => {
      if (!uploadId) return;

      setLoading(true);
      setError(null);
      // Clear demo data when fetching real data
      setNodes([]);
      setLinks([]);
      try {
        const res = await api.getAffinityNetwork(uploadId);
        if (res.success && res.data) {
          setNodes(res.data.nodes || []);
          setLinks(res.data.links || []);
        } else {
          setError(res.error?.message || "Failed to load affinity network");
        }
      } catch (e) {
        console.error("Affinity fetch error:", e);
        setError("Failed to fetch affinity analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uploadId]);

  // Prepare data for Plotly network visualization
  const edgeX: number[] = [];
  const edgeY: number[] = [];
  const nodeX: number[] = [];
  const nodeY: number[] = [];
  const nodeLabels: string[] = [];
  const nodeColors: string[] = [];
  const nodeSizes: number[] = [];

  // Create node position map (simple circular layout)
  const centerX = 0;
  const centerY = 0;
  const radius = 10;
  const angleStep = (2 * Math.PI) / nodes.length;

  const nodePositions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    const angle = i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodePositions.set(node.id, { x, y });
  });

  // Create edge coordinates
  links.forEach((link) => {
    const source = nodePositions.get(link.source);
    const target = nodePositions.get(link.target);
    if (source && target) {
      edgeX.push(source.x, target.x, null);
      edgeY.push(source.y, target.y, null);
    }
  });

  // Create node coordinates
  nodes.forEach((node) => {
    const pos = nodePositions.get(node.id);
    if (pos) {
      nodeX.push(pos.x);
      nodeY.push(pos.y);
      nodeLabels.push(node.label);
      nodeColors.push(node.color);
      nodeSizes.push(Math.max(10, Math.min(30, node.value / 10)));
    }
  });

  return (
    <section
      id="affinity"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
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
            <svg
              className="w-4 h-4 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
              <circle cx="5" cy="5" r="2" />
              <line x1="12" y1="9" x2="12" y2="5" />
              <line x1="9.5" y1="14.5" x2="6" y2="17" />
              <line x1="14.5" y1="14.5" x2="18" y2="17" />
              <line x1="9.5" y1="9.5" x2="6" y2="6" />
              <line x1="14.5" y1="9.5" x2="18" y2="6" />
            </svg>
            <span className="text-sm text-gray-300">Product Affinity</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            Discover <span className="gradient-text">Connections</span> That
            Convert
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            AI-powered market basket analysis reveals which products are
            frequently bought together. Identify bundling and cross-sell
            opportunities.
          </p>
        </motion.div>

        {/* Network visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card rounded-2xl p-4 sm:p-8 relative min-h-[500px]"
        >
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-void/50 backdrop-blur-sm z-20 rounded-2xl">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
              <p className="text-gray-400">Mapping product affinities...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-void/50 backdrop-blur-sm z-20 rounded-2xl">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-white font-medium">{error}</p>
            </div>
          ) : null}

          <Plot
            data={[
              // Edges
              {
                type: "scattergl",
                mode: "lines",
                x: edgeX,
                y: edgeY,
                line: {
                  width: 1,
                  color: "rgba(0, 240, 255, 0.3)",
                },
                hoverinfo: "none",
              },
              // Nodes
              {
                type: "scattergl",
                mode: "markers+text",
                x: nodeX,
                y: nodeY,
                marker: {
                  size: nodeSizes,
                  color: nodeColors,
                  line: {
                    color: "white",
                    width: 1,
                  },
                },
                text: nodeLabels,
                textposition: "bottom center",
                textfont: {
                  size: 10,
                  color: "white",
                },
                hoverinfo: "text",
                hovertext: nodeLabels.map(
                  (label, i) => `${label}\nValue: ${nodes[i].value}`,
                ),
              },
            ]}
            layout={{
              autosize: true,
              width: undefined,
              height: 500,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { t: 20, b: 20, l: 20, r: 20 },
              xaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
              },
              yaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                scaleanchor: "x",
                scaleratio: 1,
              },
            }}
            config={{
              responsive: true,
              displayModeBar: false,
              scrollZoom: true,
            }}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-xs text-gray-400">High Affinity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs text-gray-400">Medium Affinity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs text-gray-400">Low Affinity</span>
            </div>
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 flex gap-4">
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400">Products</div>
              <div className="text-lg font-bold text-white">{nodes.length}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400">Connections</div>
              <div className="text-lg font-bold text-white">{links.length}</div>
            </div>
          </div>
        </motion.div>

        {/* Top Affinity Rules */}
        {links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mt-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Top Product Affinities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.slice(0, 6).map((link, index) => (
                <motion.div
                  key={`${link.source}-${link.target}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-semibold">
                      {link.source}
                    </span>
                    <svg
                      className="w-4 h-4 text-cyan-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-white font-semibold">
                      {link.target}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                    <div>
                      <div className="text-gray-500">Lift</div>
                      <div className="text-cyan-400 font-semibold">
                        {link.lift.toFixed(2)}x
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Confidence</div>
                      <div className="text-purple-400 font-semibold">
                        {(link.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Support</div>
                      <div className="text-pink-400 font-semibold">
                        {(link.support * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AffinityNetwork;
