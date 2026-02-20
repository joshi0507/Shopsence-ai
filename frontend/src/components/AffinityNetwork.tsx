import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  connections: string[];
}

interface AffinityNetworkProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const AffinityNetwork = ({ containerRef }: AffinityNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (!canvasRef.current || !isInView) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize nodes
    const initialNodes: Node[] = [
      {
        id: "headphones",
        label: "Wireless Headphones",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 25,
        color: "#00F0FF",
        connections: ["phone", "case", "stand"],
      },
      {
        id: "phone",
        label: "Smartphone",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 30,
        color: "#7000FF",
        connections: ["headphones", "case", "charger"],
      },
      {
        id: "case",
        label: "Phone Case",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 18,
        color: "#FF00AA",
        connections: ["headphones", "phone"],
      },
      {
        id: "stand",
        label: "Phone Stand",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 15,
        color: "#0066FF",
        connections: ["headphones", "charger"],
      },
      {
        id: "charger",
        label: "Fast Charger",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 20,
        color: "#00FF88",
        connections: ["phone", "stand", "cable"],
      },
      {
        id: "cable",
        label: "USB-C Cable",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 14,
        color: "#FF6B00",
        connections: ["charger"],
      },
      {
        id: "watch",
        label: "Smart Watch",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 22,
        color: "#FFD700",
        connections: ["band", "charger"],
      },
      {
        id: "band",
        label: "Watch Band",
        x: 0,
        y: 0,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 12,
        color: "#FF69B4",
        connections: ["watch"],
      },
    ];

    // Spread nodes across canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const angleStep = (2 * Math.PI) / initialNodes.length;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    initialNodes.forEach((node, i) => {
      node.x = centerX + radius * Math.cos(i * angleStep);
      node.y = centerY + radius * Math.sin(i * angleStep);
    });

    setNodes(initialNodes);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          let { x, y, vx, vy } = node;

          // Mouse magnetic effect
          const dx = mousePos.x - x;
          const dy = mousePos.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            vx -= (dx / dist) * force * 0.5;
            vy -= (dy / dist) * force * 0.5;
          }

          // Spring forces between connected nodes
          node.connections.forEach((connId) => {
            const connNode = prevNodes.find((n) => n.id === connId);
            if (connNode) {
              const cdx = connNode.x - x;
              const cdy = connNode.y - y;
              const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
              const targetDist = 120;
              const force = (cdist - targetDist) * 0.01;
              vx += (cdx / cdist) * force;
              vy += (cdy / cdist) * force;
            }
          });

          // Center gravity
          const toCenterX = centerX - x;
          const toCenterY = centerY - y;
          vx += toCenterX * 0.001;
          vy += toCenterY * 0.001;

          // Damping
          vx *= 0.98;
          vy *= 0.98;

          // Update position
          x += vx;
          y += vy;

          // Boundary check
          const padding = 50;
          if (x < padding) vx += 0.5;
          if (x > canvas.width - padding) vx -= 0.5;
          if (y < padding) vy += 0.5;
          if (y > canvas.height - padding) vy -= 0.5;

          return { ...node, x, y, vx, vy };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInView, mousePos]);

  // Draw connections and nodes
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach((connId) => {
          const connNode = nodes.find((n) => n.id === connId);
          if (connNode) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connNode.x, connNode.y);

            const isHighlighted =
              hoveredNode === node.id || hoveredNode === connId;
            ctx.strokeStyle = isHighlighted
              ? "rgba(0, 240, 255, 0.6)"
              : "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = isHighlighted ? 2 : 1;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        const isHovered = hoveredNode === node.id;
        const glowRadius = isHovered ? node.radius * 2 : node.radius * 1.5;

        // Glow
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          glowRadius,
        );
        gradient.addColorStop(0, `${node.color}40`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? node.color : "#0a0a1a";
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = isHovered ? "#FFFFFF" : "#94A3B8";
        ctx.font = isHovered ? "bold 12px DM Sans" : "11px DM Sans";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + node.radius + 16);
      });
    };

    draw();
  }, [nodes, hoveredNode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseEnter={() => {
        const handleMove = (e: React.MouseEvent) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            setMousePos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }
        };
        canvasRef.current?.addEventListener("mousemove", handleMove as any);
      }}
      onMouseLeave={() => setHoveredNode(null)}
    />
  );
};

const NetworkSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="network"
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
            Visualize how your products relate to each other. Our AI identifies
            hidden affinities and suggests powerful product combinations.
          </p>
        </motion.div>

        {/* Network visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card rounded-2xl p-4 sm:p-8 h-[300px] sm:h-[400px] md:h-[500px] relative"
        >
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <AffinityNetwork containerRef={sectionRef} />
          </div>

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
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NetworkSection;
