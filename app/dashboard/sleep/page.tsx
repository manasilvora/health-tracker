"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SleepEntry = {
  id: string; date: string; duration_hours: number; quality: number; notes: string | null;
};

const qualityLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" };

export default function SleepPage() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const [entry, setEntry] = useState<SleepEntry | null>(null);
  const [history, setHistory] = useState<SleepEntry[]>([]);
  const [form, setForm] = useState({ duration_hours: "", quality: 3, notes: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: todayEntry } = await supabase.from("sleep").select("*").eq("date", today).single();
      if (todayEntry) {
        setEntry(todayEntry);
        setForm({ duration_hours: String(todayEntry.duration_hours), quality: todayEntry.quality, notes: todayEntry.notes ?? "" });
      }
      const { data: hist } = await supabase.from("sleep").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("sleep")
      .upsert({ user_id: user.id, date: today, duration_hours: parseFloat(form.duration_hours)||0,
        quality: form.quality, notes: form.notes||null }, { onConflict: "user_id,date" })
      .select().single();
    if (!error && data) {
      setEntry(data); setSaved(true); setTimeout(() => setSaved(false), 2000);
      const { data: hist } = await supabase.from("sleep").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 relative">
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)" }} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#14b8a6" }}>Sleep</p>
        <h1 className="text-2xl font-bold text-white">Sleep Tracker</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm font-semibold text-white mb-5">Log last night</p>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>
                Hours slept
              </label>
              <input type="number" min="0" max="24" step="0.25" required value={form.duration_hours} placeholder="7.5"
                onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(156,163,175,0.7)" }}>
                Quality — <span style={{ color: "#14b8a6" }}>{qualityLabels[form.quality]}</span>
              </label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((q) => (
                  <button key={q} type="button" onClick={() => setForm({ ...form, quality: q })}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                    style={form.quality === q
                      ? { background: "linear-gradient(135deg, #14b8a6, #2dd4bf)", color: "white", boxShadow: "0 0 16px rgba(20,184,166,0.35)" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(107,114,128,1)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>
                Notes
              </label>
              <input type="text" value={form.notes} placeholder="e.g. woke up twice, vivid dreams"
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-white font-bold rounded-xl py-3 text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #14b8a6, #22c55e)", boxShadow: "0 0 24px rgba(20,184,166,0.3)" }}>
              {loading ? "Saving..." : saved ? "✓ Saved" : entry ? "Update" : "Save"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm font-semibold text-white mb-5">Last 7 days</p>
          {history.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(75,85,99,1)" }}>No entries yet.</p>
          ) : (
            <div className="space-y-1">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div>
                    <p className="text-sm font-medium text-white">{h.date}</p>
                    <div className="flex gap-1 mt-1.5">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="h-1.5 w-5 rounded-full"
                          style={{ background: i <= h.quality ? "linear-gradient(90deg,#14b8a6,#2dd4bf)" : "rgba(255,255,255,0.05)" }} />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#14b8a6" }}>
                    {h.duration_hours}<span className="font-normal text-xs ml-1" style={{ color: "rgba(107,114,128,1)" }}>hrs</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
