"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../lib/auth-store";
import { api } from "../../../lib/api";
import Link from "next/link";
import { Lock, Search, Filter, Crown } from "lucide-react";

interface Influencer {
  id: string;
  user: { name: string; email: string; avatar?: string };
  category: string;
  rank?: number;
  rating: number;
  socialAccounts: Array<{
    platform: string;
    followers: number;
    engagement: number;
  }>;
}

export default function BrandLeague() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const [leagueRes, subsRes] = await Promise.all([
          api.get("/influencers/league"),
          api.get("/admin/subscriptions").catch(() => ({ data: [] })),
        ]);
        setInfluencers(leagueRes.data);
        setIsSubscribed(subsRes.data.some((s: any) => s.status === "ACTIVE"));
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
          <Link
            href="/brand/dashboard"
            className="text-2xl font-bold text-white hover:text-gray-300"
          >
            SMM League
          </Link>
          <nav className="flex gap-6 text-gray-300">
            <Link href="/brand/league" className="hover:text-white">
              League
            </Link>
            <Link href="/brand/campaigns" className="hover:text-white">
              Campaigns
            </Link>
            <Link href="/brand/deals" className="hover:text-white">
              Deals
            </Link>
          </nav>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Title & Subscription Status */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Influencer League
              </h1>
              <p className="text-gray-400">
                Discover and connect with top influencers
              </p>
            </div>
            {!isSubscribed && (
              <Link href="/brand/subscription" className="button-primary">
                Subscribe to Unlock
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={16} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Categories</option>
              <option value="Fashion">Fashion</option>
              <option value="Tech">Tech</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Beauty">Beauty</option>
              <option value="Travel">Travel</option>
            </select>
          </div>
        </div>

        {/* Influencers Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            Loading influencers...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map((influencer) => (
              <div
                key={influencer.id}
                className="card relative overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer"
              >
                {/* Rank Badge */}
                {influencer.rank && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-600/20 border border-yellow-600/50 px-2 py-1 rounded">
                    <Crown size={14} className="text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">
                      #{influencer.rank}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {influencer.user.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {influencer.category}
                  </p>
                  <div className="flex gap-1 mb-3">
                    {influencer.socialAccounts.slice(0, 3).map((acc, i) => (
                      <span key={i} className="badge text-xs">
                        {acc.platform}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                {isSubscribed ? (
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white font-mono text-xs">
                        {influencer.user.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Followers</span>
                      <span className="text-white">
                        {influencer.socialAccounts
                          .reduce((sum, acc) => sum + acc.followers, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Engagement</span>
                      <span className="text-white">
                        {(
                          influencer.socialAccounts[0]?.engagement || 0
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating</span>
                      <span className="text-yellow-400 font-semibold">
                        {influencer.rating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm mb-4 blur-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white">●●●●●●●●●●</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Followers</span>
                      <span className="text-white">●●●●●●●●●●</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Engagement</span>
                      <span className="text-white">●●●●●●●●●●</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                {!isSubscribed && (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs mb-3">
                    <Lock size={14} />
                    Subscribe to unlock contact & pricing
                  </div>
                )}

                <Link
                  href={`/brand/league/${influencer.id}`}
                  className="button-primary w-full text-center text-sm"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
