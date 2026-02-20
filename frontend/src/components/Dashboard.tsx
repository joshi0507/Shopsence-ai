import { useState } from "react";
import Sidebar from "./Sidebar";
import DataUpload from "./DataUpload";
import DataHistory from "./DataHistory";
import DashboardHome from "./DashboardHome";
import AccountSettings from "./AccountSettings";
import AnalysisReport from "./AnalysisReport";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  const handleNavigate = (tab: string) => {
    // If navigating away from report view/analysis, clear the ID
    if (tab !== "analysis") {
      setViewingReportId(null);
    }
    setActiveTab(tab);
  };

  const handleViewReport = (id: string) => {
    setViewingReportId(id);
    setActiveTab("report");
  };

  const handleBackFromReport = () => {
    setViewingReportId(null);
    // Return to history or dashboard depending on where we came from?
    // User requested "redirect to history".
    setActiveTab("history");
  };

  const renderContent = () => {
    // If explicit report ID is set, show that specific report
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
        // Auto-load latest report logic handled inside AnalysisReport with 'latest' prop
        return (
          <AnalysisReport
            onBack={() => setActiveTab("dashboard")}
            latest={true}
          />
        );
      case "account":
        return <AccountSettings user={user} />;
      case "dashboard":
      default:
        // Ensure "report" tab falls back if no ID (shouldn't happen often)
        if (activeTab === "report")
          return <DataHistory onViewReport={handleViewReport} />;
        return (
          <DashboardHome
            user={user}
            onNavigate={handleNavigate}
            onViewReport={handleViewReport}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1A2238]">
      <Sidebar
        activeTab={viewingReportId ? "history" : activeTab}
        setActiveTab={handleNavigate}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 ml-64 min-h-screen relative flex flex-col">
        {/* Background Mesh - Replaced with new logo/title structure */}
        <div className="fixed top-4 left-80 z-20 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF9E6D] to-[#FF6D6D] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#1A2238]" />
          </div>
          <span className="text-xl font-bold font-heading text-white">
            ShopSense<span className="text-[#FF9E6D]">AI</span>
          </span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex-1 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewingReportId || activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
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
    </div>
  );
};

export default Dashboard;
