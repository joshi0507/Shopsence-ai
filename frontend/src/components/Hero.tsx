import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import * as THREE from "three";

const ParticleField = ({ count = 200 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01,
        ),
        scale: Math.random() * 0.05 + 0.02,
      })),
    [count],
  );

  useFrame(() => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      particle.position.add(particle.velocity);
      if (Math.abs(particle.position.x) > 10) particle.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 10) particle.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 5) particle.velocity.z *= -1;

      dummy.position.copy(particle.position);
      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#FF9E6D" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const FloatingCube = ({ position, color, delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} delay={delay}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
};

const Dashboard3D = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { scrollYProgress } = useScroll();

  const barData = useMemo(
    () =>
      [-1.2, -0.6, 0, 0.6, 1.2].map((x) => ({
        x,
        h: 0.8 + Math.random() * 0.5,
      })),
    [],
  );

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main dashboard panel */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4, 2.5, 0.1]} />
            <meshStandardMaterial
              color="#2F2F33"
              transparent
              opacity={0.9}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Screen content */}
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[3.8, 2.3]} />
            <meshBasicMaterial color="#1A2238" />
          </mesh>

          {/* Grid lines */}
          {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
            <mesh key={`hline-${i}`} position={[x, 0, 0.07]}>
              <planeGeometry args={[0.01, 2.2]} />
              <meshBasicMaterial color="#FF9E6D" transparent opacity={0.3} />
            </mesh>
          ))}
          {[-0.9, 0, 0.9].map((y, i) => (
            <mesh key={`vline-${i}`} position={[0, y, 0.07]}>
              <planeGeometry args={[3.6, 0.01]} />
              <meshBasicMaterial color="#FF9E6D" transparent opacity={0.3} />
            </mesh>
          ))}

          {/* Chart bars */}
          {barData.map((data, i) => (
            <mesh key={`bar-${i}`} position={[data.x, -0.5, 0.08]}>
              <boxGeometry args={[0.3, data.h, 0.05]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#FF9E6D" : "#FF6D6D"}
                emissive={i % 2 === 0 ? "#FF9E6D" : "#FF6D6D"}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}

          {/* Circular element */}
          <mesh position={[1.3, 0.7, 0.08]}>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial color="#FF6D6D" transparent opacity={0.8} />
          </mesh>
          <mesh position={[1.3, 0.7, 0.09]}>
            <circleGeometry args={[0.15, 32]} />
            <meshBasicMaterial color="#FF6D6D" />
          </mesh>
        </group>
      </Float>

      {/* Floating data cubes */}
      <FloatingCube position={[-2.5, 1.5, 0]} color="#FF9E6D" delay={0} />
      <FloatingCube position={[2.5, 1.2, 0.5]} color="#FF6D6D" delay={0.5} />
      <FloatingCube position={[-2, -1.5, 0.5]} color="#FF9E6D" delay={1} />
      <FloatingCube position={[2, -1.2, 0]} color="#FF6D6D" delay={1.5} />
    </group>
  );
};

const Hero = ({
  onOpenAuth,
}: {
  onOpenAuth: (type: "login" | "signup") => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ position: 'relative' }}
    >
      {/* Animated gradient mesh background is now handled globally in body */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF9E6D] rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6D6D] rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-white/5"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF9E6D] animate-pulse" />
              <span className="text-sm text-gray-300">
                AI-Powered Analytics
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6">
              Understand Your <span className="gradient-text">Customers</span>{" "}
              Like Never Before
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl">
              AI-powered shopper behavior analytics and affinity discovery
              platform. Uncover hidden patterns, predict preferences, and
              deliver personalized experiences that convert.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenAuth("signup")}
                className="glow-button px-8 py-4 rounded-xl text-base font-semibold text-[#1A2238]"
              >
                Get Started
                <ChevronRight className="inline ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl text-base font-semibold text-white glass border border-white/10 transition-all"
              >
                View Demo
              </motion.button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              {[
                { value: "2.5M+", label: "Data Points" },
                { value: "98.5%", label: "Accuracy" },
                { value: "50K+", label: "Active Users" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
                >
                  <div className="text-2xl md:text-3xl font-bold font-heading gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: 3D Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative h-[400px] md:h-[500px]"
          >
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight
                position={[10, 10, 10]}
                intensity={1}
                color="#FF9E6D"
              />
              <pointLight
                position={[-10, -10, -10]}
                intensity={0.5}
                color="#FF6D6D"
              />
              <Dashboard3D />
            </Canvas>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
        >
          <motion.div className="w-1 h-2 rounded-full bg-[#FF9E6D]" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
