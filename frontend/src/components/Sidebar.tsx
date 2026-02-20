import { motion } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Upload,
  Settings,
  LogOut,
  User,
  Sparkles,
  PieChart,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "upload", label: "Data Upload", icon: Upload },
    { id: "analysis", label: "Analysis", icon: PieChart },
    { id: "history", label: "History", icon: History },
    { id: "account", label: "Account", icon: Settings },
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col z-50"
    >
      {/* Logo Area */}
      <div className="p-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF9E6D] to-[#FF6D6D] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#1A2238]" />
          </div>
          <span className="text-xl font-bold font-heading text-white">
            ShopSense<span className="text-[#FF9E6D]">AI</span>
          </span>
        </button>
      </div>

      {/* User Info */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6D6D] to-[#FF9E6D] flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-medium text-white truncate">
              {user?.username || "User"}
            </h4>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-gradient-to-r from-[#FF9E6D]/20 to-[#FF6D6D]/20 border border-[#FF9E6D]/30 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-[#FF9E6D]" : "group-hover:text-[#FF9E6D]"}`}
              />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-8 bg-[#FF9E6D] rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
