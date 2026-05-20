"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)", boxShadow: "0 0 30px rgba(34,211,238,0.4)" }}>
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to HealthTrack</p>
        </div>

        <form onSubmit={handleLogin}
          className="rounded-2xl p-6 space-y-4 backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(34,211,238,0.5)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(34,211,238,0.5)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full text-white font-bold rounded-xl py-3 text-sm mt-2 transition-all disabled:opacity-40 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)", boxShadow: "0 0 25px rgba(34,211,238,0.35)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-500 pt-1">
            No account?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "#22d3ee" }}>Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
