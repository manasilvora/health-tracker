"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#060d0d] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-15%] right-[-5%] w-[550px] h-[550px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)" }} />
        <div className="text-center z-10 relative">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm" style={{ color: "rgba(156,163,175,1)" }}>
            We sent a link to <span className="text-white">{email}</span>
          </p>
          <Link href="/login" className="inline-block mt-6 text-sm font-semibold" style={{ color: "#4ade80" }}>
            Back to sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d0d] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-5%] w-[550px] h-[550px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #22c55e, #14b8a6)", boxShadow: "0 0 32px rgba(34,197,94,0.4)" }}>
            <span className="text-white font-bold text-xl tracking-tight">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create account</h1>
          <p className="text-gray-400 text-sm">Start your Cadence</p>
        </div>

        <form onSubmit={handleSignup} className="rounded-2xl p-6 space-y-4 backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          {[
            { label: "Email", type: "email", value: email, onChange: setEmail, placeholder: "you@example.com", min: undefined },
            { label: "Password", type: "password", value: password, onChange: setPassword, placeholder: "Min. 6 characters", min: 6 },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>{f.label}</label>
              <input type={f.type} required minLength={f.min} value={f.value} placeholder={f.placeholder}
                onChange={(e) => f.onChange(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full text-white font-bold rounded-xl py-3 text-sm mt-1 transition-all disabled:opacity-40 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #22c55e, #14b8a6)", boxShadow: "0 0 28px rgba(34,197,94,0.35)" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm pt-1" style={{ color: "rgba(107,114,128,1)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#4ade80" }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
