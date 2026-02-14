"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role === "BRAND") {
      router.push("/brand/dashboard");
    } else if (user.role === "INFLUENCER") {
      router.push("/influencer/dashboard");
    } else if (user.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">SMM League</h1>
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
