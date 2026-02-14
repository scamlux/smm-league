"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../lib/auth-store";
import { api } from "../../../lib/api";
import Link from "next/link";
import {
  Users,
  Zap,
  TrendingUp,
  Shield,
  AlertCircle,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    users: 0,
    influencers: 0,
    campaigns: 0,
    deals: 0,
    activeSubscriptions: 0,
  });
  const [recentActions, setRecentActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setStats(response.data.stats);
        setRecentActions(response.data.recentActions);
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="text-red-500" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-gray-400">
                God Mode - Full System Control
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.users}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Influencers</p>
                <p className="text-3xl font-bold text-white">
                  {stats.influencers}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Campaigns</p>
                <p className="text-3xl font-bold text-white">
                  {stats.campaigns}
                </p>
              </div>
              <Zap className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Active Deals</p>
                <p className="text-3xl font-bold text-white">{stats.deals}</p>
              </div>
              <AlertCircle className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Subscriptions</p>
                <p className="text-3xl font-bold text-white">
                  {stats.activeSubscriptions}
                </p>
              </div>
              <Shield className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Management Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="card hover:border-blue-500/50 cursor-pointer transition-all"
            >
              <Users className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold text-white mb-1">
                Users Management
              </h3>
              <p className="text-sm text-gray-400">
                Create, edit, delete users. Switch roles.
              </p>
            </Link>

            <Link
              href="/admin/bloggers"
              className="card hover:border-green-500/50 cursor-pointer transition-all"
            >
              <TrendingUp className="text-green-500 mb-2" size={24} />
              <h3 className="font-semibold text-white mb-1">
                Influencer Management
              </h3>
              <p className="text-sm text-gray-400">
                Edit profiles and manually update rankings.
              </p>
            </Link>

            <Link
              href="/admin/campaigns"
              className="card hover:border-yellow-500/50 cursor-pointer transition-all"
            >
              <Zap className="text-yellow-500 mb-2" size={24} />
              <h3 className="font-semibold text-white mb-1">Campaigns</h3>
              <p className="text-sm text-gray-400">
                Create and manage all campaigns.
              </p>
            </Link>

            <Link
              href="/admin/deals"
              className="card hover:border-purple-500/50 cursor-pointer transition-all"
            >
              <AlertCircle className="text-purple-500 mb-2" size={24} />
              <h3 className="font-semibold text-white mb-1">Deals</h3>
              <p className="text-sm text-gray-400">
                Force complete or update deal status.
              </p>
            </Link>

            <Link
              href="/admin/subscriptions"
              className="card hover:border-red-500/50 cursor-pointer transition-all"
            >
              <Shield className="text-red-500 mb-2" size={24} />
              <h3 className="font-semibold text-white mb-1">Subscriptions</h3>
              <p className="text-sm text-gray-400">
                Activate/deactivate user subscriptions.
              </p>
            </Link>

            <Link
              href="/admin/payments"
              className="card hover:border-orange-500/50 cursor-pointer transition-all"
            >
              <TrendingUp className="text-orange-500 mb-2" size={24} />
              <h3 className="font-semibold text-white mb-1">Payments</h3>
              <p className="text-sm text-gray-400">
                View and manage payment records.
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Admin Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-red-500" />
            Recent Admin Actions (Audit Log)
          </h3>

          {recentActions.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent admin actions</p>
          ) : (
            <div className="space-y-3">
              {recentActions.map((action: any, i) => (
                <div
                  key={i}
                  className="flex justify-between items-start p-3 bg-slate-700/20 rounded border border-slate-600/30"
                >
                  <div>
                    <p className="text-white font-mono text-sm">
                      {action.action}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {action.admin?.name} •{" "}
                      {new Date(action.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {action.targetId && (
                    <p className="text-gray-400 text-xs font-mono">
                      {action.targetId.slice(0, 8)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/audit-logs"
            className="text-blue-400 hover:text-blue-300 text-sm mt-4 inline-block"
          >
            View All Audit Logs →
          </Link>
        </div>
      </main>
    </div>
  );
}
