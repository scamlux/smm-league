"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../lib/auth-store";

export default function RegisterPage() {
  const [step, setStep] = useState<"role" | "info">("role");
  const [role, setRole] = useState<"BRAND" | "INFLUENCER" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register, loading, error } = useAuthStore();
  const router = useRouter();

  const handleRoleSelect = (selectedRole: "BRAND" | "INFLUENCER") => {
    setRole(selectedRole);
    setStep("info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    const user = await register(email, password, name, role);
    if (!user) return;
    router.push(
      user.role === "INFLUENCER" ? "/influencer/dashboard" : "/brand/dashboard",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            SMM League
          </h1>
          <p className="text-gray-400 mb-8">Create your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === "role" ? (
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect("BRAND")}
                className="w-full p-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded text-left text-white transition-colors"
              >
                <div className="font-semibold">Brand / Business</div>
                <div className="text-sm text-gray-400">
                  Find and collaborate with influencers
                </div>
              </button>
              <button
                onClick={() => handleRoleSelect("INFLUENCER")}
                className="w-full p-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded text-left text-white transition-colors"
              >
                <div className="font-semibold">Influencer / Blogger</div>
                <div className="text-sm text-gray-400">
                  Showcase your profile and get campaigns
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
              <button
                type="button"
                onClick={() => setStep("role")}
                className="w-full py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded font-semibold transition-colors"
              >
                Back
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">Already have an account?</p>
            <a
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 block"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
