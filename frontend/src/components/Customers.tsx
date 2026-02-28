import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserCircle,
  Network,
  Heart,
  BarChart3,
  Search,
  Filter,
  Download,
} from "lucide-react";
import Personas from "./Personas";
import AffinityNetwork from "./AffinityNetwork";
import Sentiment from "./Sentiment";
import CustomerSegments from "./CustomerSegments";
import CustomerList from "./CustomerList";
import { api } from "../lib/api";

interface CustomersProps {
  user: any;
  uploadId?: string;
}

const Customers = ({ user, uploadId }: CustomersProps) => {
  const [activeSubTab, setActiveSubTab] = useState("segments");
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // We no longer need to fetch latest upload here as it's passed from parent
  const latestUploadId = uploadId;

  const handleViewCustomers = (segmentId: number) => {
    setSelectedSegmentId(segmentId);
    setActiveSubTab("list");
  };

  const subTabs = [
    { id: "segments", label: "Segments", icon: Users },
    { id: "personas", label: "Personas", icon: UserCircle },
    { id: "affinity", label: "Affinity", icon: Network },
    { id: "sentiment", label: "Sentiment", icon: Heart },
  ];

  const renderSubContent = () => {
    switch (activeSubTab) {
      case "personas":
        return <Personas uploadId={latestUploadId} />;
      case "affinity":
        return <AffinityNetwork uploadId={latestUploadId} />;
      case "sentiment":
        return <Sentiment uploadId={latestUploadId} />;
      case "list":
        if (selectedSegmentId !== null) {
          return (
            <CustomerList
              uploadId={latestUploadId}
              segmentId={selectedSegmentId}
              onBack={() => setActiveSubTab("segments")}
            />
          );
        }
        return (
          <CustomerSegments
            uploadId={latestUploadId}
            onViewCustomers={handleViewCustomers}
          />
        );
      case "segments":
      default:
        return (
          <CustomerSegments
            uploadId={latestUploadId}
            onViewCustomers={handleViewCustomers}
          />
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-heading">
            Customer <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-gray-400">
            Deep dive into behavior patterns, emotional sentiment, and purchase
            affinities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm">
            <Download size={16} />
            Export Data
          </button>
          <button className="px-4 py-2 rounded-xl bg-cyan-500 text-void font-bold hover:scale-105 transition-all text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            Generate Report
          </button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : ""}`} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[600px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading customer insights...</p>
          </div>
        ) : !latestUploadId ? (
          <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No Analysis Data Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              To see real-time customer intelligence, please upload your sales
              data first.
            </p>
            <button className="glow-button px-8 py-4 rounded-xl font-bold text-void">
              Go to Upload
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSubContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Customers;
