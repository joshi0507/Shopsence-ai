import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Shield,
  Zap,
  Bell,
  Download,
  Check,
  X,
  Loader2,
  Camera,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "../lib/api";

interface AccountSettingsProps {
  user: any;
}

const AccountSettings = ({ user }: AccountSettingsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState({
    notifications: true,
    autoAnalysis: true,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await api.updateProfile(profileData);
      if (res.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(res.error?.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await api.changePassword(
        passwordData.current,
        passwordData.new,
      );
      if (res.success) {
        setSuccess("Password changed successfully!");
        setIsChangingPassword(false);
        setPasswordData({ current: "", new: "", confirm: "" });
      } else {
        setError(res.error?.message || "Failed to change password");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white">
            Account <span className="gradient-text">Settings</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Manage your identity and platform preferences.
          </p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 font-bold hover:scale-105 transition-all text-sm">
          UPGRADE TO PRO
        </button>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3"
          >
            <Check size={18} /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
          >
            <X size={18} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card rounded-2xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-white/10 relative z-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 p-1 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full rounded-full bg-[#1A2238] flex items-center justify-center overflow-hidden">
                <span className="text-4xl font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <button className="absolute bottom-1 right-1 p-2 rounded-full bg-cyan-500 text-void border-2 border-[#1A2238] hover:scale-110 transition-all">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-1">
              {user?.username}
            </h3>
            <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
              <span className={`w-2 h-2 rounded-full bg-cyan-500`} />
              {user?.role === "admin" ? "Administrator" : "Standard User"}
            </p>
            <div className="flex justify-center md:justify-start gap-3 mt-6">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/10"
                >
                  EDIT PROFILE
                </button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-6 py-2 rounded-xl bg-cyan-500 text-void text-sm font-bold transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "SAVE"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold transition-all border border-red-500/20"
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs/Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          {/* Identity Section */}
          <div className="space-y-8">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-cyan-400" /> IDENTITY
            </h4>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Unique Username
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Primary Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-8">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" /> SECURITY
            </h4>

            <div className="space-y-4">
              {isChangingPassword ? (
                <form
                  onSubmit={handleChangePassword}
                  className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Current Password"
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-10 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-cyan-500/50 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                      {loading && (
                        <Loader2 size={16} className="animate-spin" />
                      )}{" "}
                      UPDATE
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="px-4 py-2 border border-white/10 text-gray-400 rounded-lg"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                >
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">
                    CHANGE MASTER PASSWORD
                  </span>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated 30d ago
                  </div>
                </button>
              )}

              <div className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm font-bold text-gray-300">
                  TWO-FACTOR AUTH (2FA)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                    DISABLED
                  </span>
                  <div className="w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
          <h4 className="text-lg font-bold text-white mb-6 tracking-wide">
            SYSTEM PREFERENCES
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${prefs.notifications ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/5 border-white/5"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${prefs.notifications ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-gray-500"}`}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">
                    Insight Alerts
                  </h5>
                  <p className="text-xs text-gray-500">
                    Get push updates for 10% movement
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPrefs({ ...prefs, notifications: !prefs.notifications })
                }
                className={`w-12 h-6 rounded-full relative transition-colors ${prefs.notifications ? "bg-cyan-500" : "bg-gray-700"}`}
              >
                <motion.div
                  animate={{ x: prefs.notifications ? 26 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>

            <div
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${prefs.autoAnalysis ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${prefs.autoAnalysis ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-gray-500"}`}
                >
                  <Zap size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">
                    Turbo Analysis
                  </h5>
                  <p className="text-xs text-gray-500">
                    Auto-process uploads in background
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPrefs({ ...prefs, autoAnalysis: !prefs.autoAnalysis })
                }
                className={`w-12 h-6 rounded-full relative transition-colors ${prefs.autoAnalysis ? "bg-purple-500" : "bg-gray-700"}`}
              >
                <motion.div
                  animate={{ x: prefs.autoAnalysis ? 26 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
        <div>
          <h5 className="text-red-400 font-bold text-sm">Danger Zone</h5>
          <p className="text-xs text-gray-500">
            Deleting your account is permanent and cannot be undone.
          </p>
        </div>
        <button
          onClick={async () => {
            if (
              confirm(
                "Are you sure you want to PERMANENTLY delete your account? This action cannot be undone and all your data will be lost.",
              )
            ) {
              setLoading(true);
              try {
                const res = await api.deleteAccount();
                if (res.success) {
                  // Logout user and redirect to login
                  localStorage.removeItem("shop_sense_token");
                  window.location.href = "/login";
                } else {
                  setError(res.error?.message || "Failed to delete account");
                }
              } catch (err) {
                setError("Network error occurred");
              } finally {
                setLoading(false);
              }
            }
          }}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          DELETE ACCOUNT
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;

import { Clock } from "lucide-react";
