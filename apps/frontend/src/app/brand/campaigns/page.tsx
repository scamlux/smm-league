"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BrandCampaigns() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <Link
            href="/brand/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-4">My Campaigns</h2>
          <p className="text-gray-400 mb-6">
            Create and manage your advertising campaigns
          </p>
          <Link href="/brand/campaigns/create" className="button-primary">
            Create Campaign
          </Link>
        </div>
      </main>
    </div>
  );
}
