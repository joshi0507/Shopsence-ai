import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import DataUpload from "./DataUpload";
import DataHistory from "./DataHistory";
import DashboardHome from "./DashboardHome";
import AccountSettings from "./AccountSettings";
import AnalysisReport from "./AnalysisReport";
import Footer from "./Footer";
import WelcomeCelebration from "./WelcomeCelebration";
import GuidedTour from "./GuidedTour";
import Customers from "./Customers";
import Tips from "./Tips";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Menu,
  Bell,
  Search,
  X,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { api } from "../lib/api";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "tip";
  message: string;
  timestamp: Date;
}

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userProgress, setUserProgress] = useState({
    uploads: 0,
    analyses: 0,
    insights: 0,
  });
  const [latestUploadId, setLatestUploadId] = useState<string | undefined>(
    undefined,
  );

  // Check if this is first login and show welcome
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem("hasSeenWelcome", "true");
    }

    // Check if tour has been completed
    const hasCompletedTour = localStorage.getItem("hasCompletedTour");
    if (!hasCompletedTour && user) {
      // Auto-start tour after welcome animation
      const timer = setTimeout(() => setShowTour(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Fetch user progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.getUploads();
        if (res.success && res.data) {
          const completed = res.data.filter(
            (f: any) => f.status === "completed",
          );
          if (completed.length > 0) {
            setLatestUploadId(completed[0].upload_id);
          }
          setUserProgress({
            uploads: res.data.length,
            analyses: completed.length,
            insights: completed.length * 3, // Estimate insights per analysis
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProgress();
  }, [activeTab]);

  // Real-time notifications
  const addNotification = useCallback(
    (type: Notification["type"], message: string) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 5));

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id),
        );
      }, 5000);
    },
    [],
  );

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.getUploads();
      if (res.success && res.data) {
        const filtered = res.data.filter((f: any) =>
          f.filename.toLowerCase().includes(query.toLowerCase()),
        );
        setSearchResults(filtered.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNavigate = (tab: string) => {
    if (tab !== "analysis") {
      setViewingReportId(null);
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);

    // Add navigation feedback
    const messages: Record<string, string> = {
      upload: "Ready to upload new data!",
      history: "Viewing your analysis history",
      analysis: "Accessing latest insights",
      account: "Managing your account settings",
      dashboard: "Back to dashboard home",
    };
    addNotification("info", messages[tab] || "Navigating...");
  };

  const handleViewReport = (id: string) => {
    setViewingReportId(id);
    setActiveTab("report");
    addNotification("success", "Opening analysis report");
  };

  const handleBackFromReport = () => {
    setViewingReportId(null);
    setActiveTab("history");
  };

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem("hasCompletedTour", "true");
    addNotification("success", "🎉 Tour completed! You're all set!");
  };

  const renderContent = () => {
    if (viewingReportId && activeTab === "report") {
      return (
        <AnalysisReport
          reportId={viewingReportId}
          onBack={handleBackFromReport}
        />
      );
    }

    switch (activeTab) {
      case "upload":
        return <DataUpload onViewReport={handleViewReport} />;
      case "history":
        return <DataHistory onViewReport={handleViewReport} />;
      case "analysis":
        return (
          <AnalysisReport
            onBack={() => setActiveTab("dashboard")}
            latest={true}
          />
        );
      case "customers":
        return <Customers user={user} uploadId={latestUploadId} />;
      case "tips":
        return <Tips uploadId={latestUploadId} />;
      case "account":
        return <AccountSettings user={user} />;
      case "dashboard":
      default:
        if (activeTab === "report")
          return <DataHistory onViewReport={handleViewReport} />;
        return (
          <DashboardHome
            user={user}
            onNavigate={handleNavigate}
            onViewReport={handleViewReport}
            uploadId={latestUploadId}
          />
        );
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min(
    ((userProgress.uploads * 20 +
      userProgress.analyses * 30 +
      userProgress.insights * 2) /
      100) *
      100,
    100,
  );

  return (
    <div className="flex min-h-screen bg-[#1A2238] relative overflow-x-hidden">
      {/* Welcome Celebration Modal */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeCelebration
            user={user}
            onComplete={() => setShowWelcome(false)}
          />
        )}
      </AnimatePresence>

      {/* Guided Tour */}
      <AnimatePresence>
        {showTour && (
          <GuidedTour
            onComplete={completeTour}
            onSkip={() => {
              setShowTour(false);
              localStorage.setItem("hasCompletedTour", "true");
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <Sidebar
        activeTab={viewingReportId ? "history" : activeTab}
        setActiveTab={handleNavigate}
        user={user}
        onLogout={onLogout}
        isMobile={true}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={viewingReportId ? "history" : activeTab}
        setActiveTab={handleNavigate}
        user={user}
        onLogout={onLogout}
        isMobile={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area - Adjusts for sidebar */}
      <main
        className={`flex-1 min-h-screen relative flex flex-col transition-all duration-300 ${
          isMobileMenuOpen ? "ml-0 md:ml-64" : "ml-0"
        } ${!isMobileMenuOpen && isSidebarCollapsed ? "md:ml-20" : ""} ${
          !isMobileMenuOpen && !isSidebarCollapsed ? "md:ml-64" : ""
        }`}
      >
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-[#1A2238]/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF9E6D] to-[#FF6D6D] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#1A2238]" />
              </div>
              <span className="text-lg font-bold font-heading text-white">
                ShopSense<span className="text-[#FF9E6D]">AI</span>
              </span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Desktop Header with Search & Progress */}
        <header className="hidden md:flex sticky top-0 z-40 bg-[#1A2238]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex-1 flex items-center justify-between px-6 py-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your analyses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1A2238] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
                  >
                    {searchResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (result.status === "completed") {
                            handleViewReport(result.upload_id);
                          }
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate">
                            {result.filename}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(result.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Right Section: Progress & Notifications */}
            <div className="flex items-center gap-4 ml-6">
              {/* Progress Indicator */}
              <div className="group relative">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 cursor-default">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white font-medium">
                    {Math.round(progressPercentage)}%
                  </span>
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Progress Tooltip */}
                <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-[#1A2238] border border-white/10 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="text-xs text-gray-400 mb-2">Your Progress</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Uploads</span>
                      <span className="text-cyan-400">
                        {userProgress.uploads}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Analyses</span>
                      <span className="text-purple-400">
                        {userProgress.analyses}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Insights</span>
                      <span className="text-pink-400">
                        {userProgress.insights}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate("upload")}
                  className="p-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white shadow-lg shadow-cyan-500/20"
                >
                  <Zap className="w-4 h-4" />
                </motion.button>

                {/* Notification Bell */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-gray-300" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewingReportId || activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="relative z-20 mt-auto">
            <Footer />
          </div>
        </div>
      </main>

      {/* Notifications Toast */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl ${
                notification.type === "success"
                  ? "bg-green-500/20 border border-green-500/30"
                  : notification.type === "warning"
                    ? "bg-yellow-500/20 border border-yellow-500/30"
                    : notification.type === "tip"
                      ? "bg-cyan-500/20 border border-cyan-500/30"
                      : "bg-white/10 border border-white/20"
              }`}
            >
              {notification.type === "success" && (
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              )}
              {notification.type === "info" && (
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
              )}
              {notification.type === "warning" && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              )}
              {notification.type === "tip" && (
                <Zap className="w-4 h-4 text-cyan-400" />
              )}
              <p className="text-sm text-white">{notification.message}</p>
              <button
                onClick={() =>
                  setNotifications((prev) =>
                    prev.filter((n) => n.id !== notification.id),
                  )
                }
                className="ml-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
