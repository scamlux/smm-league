"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BrandSubscription() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Subscription</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Basic", "Pro", "Enterprise"].map((tier) => (
            <div key={tier} className="card">
              <h3 className="text-xl font-semibold text-white mb-2">{tier}</h3>
              <p className="text-gray-400 text-sm mb-4">
                Perfect for {tier.toLowerCase()}
              </p>
              <div className="text-3xl font-bold text-white mb-4">
                {tier === "Basic" ? "$99" : tier === "Pro" ? "$299" : "$999"}
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <button className="button-primary w-full text-center">
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
