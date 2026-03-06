import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Upload,
  Settings,
  LogOut,
  User,
  Sparkles,
  PieChart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Lightbulb,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isMobile = false,
  isOpen = true,
  onClose,
  onToggle,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      tourId: "sidebar-dashboard",
    },
    {
      id: "upload",
      label: "Data Upload",
      icon: Upload,
      tourId: "sidebar-upload",
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: PieChart,
      tourId: "sidebar-analysis",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      tourId: "sidebar-history",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      tourId: "sidebar-customers",
    },
    { id: "tips", label: "Tips", icon: Lightbulb, tourId: "sidebar-tips" },
    {
      id: "account",
      label: "Account",
      icon: Settings,
      tourId: "sidebar-account",
    },
  ];

  // Mobile sidebar variant
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Slide-out panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#1A2238] border-r border-white/10 z-50 md:hidden flex flex-col"
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF9E6D] to-[#FF6D6D] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#1A2238]" />
                  </div>
                  <span className="text-lg font-bold font-heading text-white">
                    ShopSense<span className="text-[#FF9E6D]">AI</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6D6D] to-[#FF9E6D] flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="overflow-hidden min-w-0">
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
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose?.();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 group min-h-[52px] text-left ${
                        isActive
                          ? "bg-gradient-to-r from-[#FF9E6D]/20 to-[#FF6D6D]/20 border border-[#FF9E6D]/30 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 flex-shrink-0 ${
                          isActive
                            ? "text-[#FF9E6D]"
                            : "group-hover:text-[#FF9E6D]"
                        }`}
                      />
                      <span className="font-medium text-base">
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="ml-auto w-1 h-6 bg-[#FF9E6D] rounded-l-full"
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
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium min-h-[52px]"
                >
                  <LogOut className="w-6 h-6 flex-shrink-0" />
                  <span className="text-base">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-screen bg-[#1A2238]/90 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 transition-all duration-300 hidden md:flex ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Area */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 transition-opacity ${
            isCollapsed ? "justify-center w-full" : "w-full text-left"
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#FF9E6D] to-[#FF6D6D] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[#1A2238]" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold font-heading text-white whitespace-nowrap">
              ShopSense<span className="text-[#FF9E6D]">AI</span>
            </span>
          )}
        </button>
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden lg:block"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Collapse toggle for collapsed state */}
      {isCollapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 p-1.5 bg-[#1A2238] border border-white/10 rounded-full hover:bg-white/10 transition-colors z-50"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6D6D] to-[#FF9E6D] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden min-w-0">
              <h4 className="text-sm font-medium text-white truncate">
                {user?.username || "User"}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              data-tour={item.tourId}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group min-h-[48px] ${
                isActive
                  ? "bg-gradient-to-r from-[#FF9E6D]/20 to-[#FF6D6D]/20 border border-[#FF9E6D]/30 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? "text-[#FF9E6D]" : "group-hover:text-[#FF9E6D]"
                }`}
              />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
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
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium min-h-[48px] ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
