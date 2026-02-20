import { motion } from "framer-motion";
import { User, Mail, Shield, Zap, Bell, Download } from "lucide-react";

interface AccountSettingsProps {
  user: any;
}

const AccountSettings = ({ user }: AccountSettingsProps) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold font-heading text-white">
          Account <span className="gradient-text">Settings</span>
        </h2>
        <button className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium hover:bg-purple-500/20 transition-all">
          Upgrade to Pro
        </button>
      </div>

      <div className="glass rounded-xl p-8 border border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-3xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{user?.username}</h3>
            <p className="text-gray-400">
              {user?.role === "admin" ? "Administrator" : "Standard User"}
            </p>
            <div className="flex gap-3 mt-4">
              <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all">
                Change Avatar
              </button>
              <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 text-sm font-medium transition-all">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" /> Personal Info
            </h4>

            <div className="space-y-4">
              <div className="group">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Username
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 group-hover:border-white/20 transition-colors">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white text-sm flex-1">
                    {user?.username}
                  </span>
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                  Email Address
                </label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 group-hover:border-white/20 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-white text-sm flex-1">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" /> Security
            </h4>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                  Change Password
                </span>
                <div className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">
                  Last changed 30d ago
                </div>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                  Two-Factor Authentication
                </span>
                <div className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                  Disabled
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h4 className="text-lg font-semibold text-white mb-6">Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-400" />
                <div>
                  <h5 className="font-medium text-white text-sm">
                    Email Notifications
                  </h5>
                  <p className="text-xs text-gray-500">
                    Receive weekly insight reports
                  </p>
                </div>
              </div>
              <div className="w-10 h-6 bg-cyan-500/20 rounded-full relative cursor-pointer border border-cyan-500/30">
                <div className="absolute right-1 top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-orange-400" />
                <div>
                  <h5 className="font-medium text-white text-sm">
                    Auto-Analysis
                  </h5>
                  <p className="text-xs text-gray-500">
                    Automatically process new uploads
                  </p>
                </div>
              </div>
              <div className="w-10 h-6 bg-cyan-500/20 rounded-full relative cursor-pointer border border-cyan-500/30">
                <div className="absolute right-1 top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-all">
            Cancel
          </button>
          <button className="glow-button px-6 py-2 rounded-lg text-void font-bold transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
