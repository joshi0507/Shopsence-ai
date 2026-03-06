import { motion } from "framer-motion";
import { useRef, ReactNode, useEffect } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

// CSS for the reveal animation - injected once
let styleInjected = false;
const injectStyles = () => {
  if (styleInjected) return;
  const style = document.createElement("style");
  style.textContent = `
    .scroll-reveal-container {
      contain: layout style paint;
    }
    .scroll-reveal-item {
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(style);
  styleInjected = true;
};

export const ScrollReveal = ({
  children,
  direction = "up",
  delay = 0,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Inject styles on first render
  useEffect(() => {
    injectStyles();
  }, []);

  const getVariants = () => {
    const hidden = { opacity: 0 };
    const visible = { opacity: 1, x: 0, y: 0 };

    switch (direction) {
      case "up":
        return {
          hidden: { ...hidden, y: 50 },
          visible,
        };
      case "down":
        return {
          hidden: { ...hidden, y: -50 },
          visible,
        };
      case "left":
        return {
          hidden: { ...hidden, x: 50 },
          visible,
        };
      case "right":
        return {
          hidden: { ...hidden, x: -50 },
          visible,
        };
      default:
        return {
          hidden: { ...hidden, y: 50 },
          visible,
        };
    }
  };

  const variants = getVariants();

  return (
    <div ref={ref} className="scroll-reveal-container">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        variants={variants}
        className="scroll-reveal-item"
      >
        {children}
      </motion.div>
    </div>
  );
};

export const UseSkewScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return { containerRef };
};
