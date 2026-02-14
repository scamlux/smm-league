"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../lib/auth-store";
import { api } from "../../../lib/api";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  MessageSquare,
  LogOut,
} from "lucide-react";

export default function BrandDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    campaigns: 0,
    deals: 0,
    influencers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "BRAND") {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const [campaigns, deals] = await Promise.all([
          api.get("/campaigns"),
          api.get("/deals"),
        ]);
        setStats({
          campaigns: campaigns.data.length,
          deals: deals.data.length,
          influencers: 0,
        });
      } catch (error) {
        console.error("Failed to load data", error);
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
          <div>
            <h1 className="text-2xl font-bold text-white">SMM League</h1>
            <p className="text-sm text-gray-400">Brand Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{user.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Active Campaigns</p>
                <p className="text-3xl font-bold text-white">
                  {stats.campaigns}
                </p>
              </div>
              <Target className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Active Deals</p>
                <p className="text-3xl font-bold text-white">{stats.deals}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">Subscribed</p>
                <p className="text-3xl font-bold text-white">Pro</p>
              </div>
              <Users className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/brand/league"
            className="card hover:border-blue-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Explore Influencers
                </h3>
                <p className="text-gray-400 text-sm">
                  Browse and filter influencers by category, platform, and
                  engagement
                </p>
              </div>
              <Users className="text-blue-500 flex-shrink-0" size={24} />
            </div>
          </Link>

          <Link
            href="/brand/campaigns"
            className="card hover:border-green-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Manage Campaigns
                </h3>
                <p className="text-gray-400 text-sm">
                  Create new campaigns, review bids, and accept collaborations
                </p>
              </div>
              <Target className="text-green-500 flex-shrink-0" size={24} />
            </div>
          </Link>

          <Link
            href="/brand/deals"
            className="card hover:border-purple-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  View Deals
                </h3>
                <p className="text-gray-400 text-sm">
                  Track active deals, content submissions, and approvals
                </p>
              </div>
              <BarChart3 className="text-purple-500 flex-shrink-0" size={24} />
            </div>
          </Link>

          <Link
            href="/brand/subscription"
            className="card hover:border-orange-500/50 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Subscription
                </h3>
                <p className="text-gray-400 text-sm">
                  Manage your subscription plan and access premium features
                </p>
              </div>
              <TrendingUp className="text-orange-500 flex-shrink-0" size={24} />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <p className="text-gray-400 text-sm">
            No recent activity yet. Start by exploring influencers or creating a
            campaign.
          </p>
        </div>
      </main>
    </div>
  );
}
