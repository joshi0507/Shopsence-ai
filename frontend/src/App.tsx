import { useEffect, useState } from "react";
import Lenis from "lenis";
import { api } from "./lib/api";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Analytics from "./components/Analytics";
import Personas from "./components/Personas";
import NetworkSection from "./components/AffinityNetwork";
import Sentiment from "./components/Sentiment";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import Dashboard from "./components/Dashboard";
import AuthModal from "./components/AuthModal";

import { ScrollReveal } from "./components/ScrollReveal";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "signup">("login");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check if token exists before making API call to avoid 401 console errors
    const token = localStorage.getItem("shopsense_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      if (res && res.success) {
        setUser(res.data);
      }
    } catch (e: any) {
      if (e.name === "AuthenticationError") {
        localStorage.removeItem("shopsense_token");
      }
      // Silent fail for auth errors - expected when not logged in
      if (
        e.name !== "AuthenticationError" &&
        e.message !== "Authentication token required" &&
        e.code !== "TOKEN_MISSING"
      ) {
        console.error("Auth check failed", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const openAuth = (type: "login" | "signup") => {
    setAuthType(type);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    // Initialize Lenis for smooth scrolling with optimized settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Only run RAF when needed to save resources
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Buzzy texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is authenticated, render the Dashboard
  if (user) {
    return (
      <div
        className="min-h-screen bg-black text-white overflow-hidden relative"
        style={{ position: "relative" }}
      >
        {/* Buzzy texture overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10">
          <CustomCursor />
          <Dashboard user={user} onLogout={handleLogout} />
        </div>
      </div>
    );
  }

  // Otherwise, render the Landing Page
  return (
    <div
      className="min-h-screen bg-black text-white overflow-x-hidden"
      style={{ position: "relative" }}
    >
      {/* Buzzy texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Custom cursor */}
      <CustomCursor />

      {/* Animated background elements handled by CSS and specific components */}

      {/* Navbar */}
      <Navbar onOpenAuth={openAuth} />

      {/* Main content */}
      <main className="relative z-10" style={{ position: "relative" }}>
        <ScrollReveal>
          <Hero onOpenAuth={openAuth} />
        </ScrollReveal>

        <ScrollReveal direction="left">
          <Features />
        </ScrollReveal>

        <ScrollReveal direction="right">
          <Analytics />
        </ScrollReveal>

        <ScrollReveal>
          <Personas />
        </ScrollReveal>

        <ScrollReveal direction="up">
          <NetworkSection />
        </ScrollReveal>

        <ScrollReveal direction="down">
          <Sentiment />
        </ScrollReveal>

        <ScrollReveal>
          <CTA onOpenAuth={openAuth} />
        </ScrollReveal>
      </main>

      {/* Footer */}
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authType}
        setType={setAuthType}
        onLoginSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}

export default App;
