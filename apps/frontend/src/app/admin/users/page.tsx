"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminUsers() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>
          <button className="button-primary">Create New User</button>
        </div>

        <div className="card">
          <p className="text-gray-400">User list will display here</p>
        </div>
      </main>
    </div>
  );
}
