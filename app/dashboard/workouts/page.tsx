"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WorkoutEntry = {
  id: string; date: string; type: string; duration_minutes: number; intensity: number; notes: string | null;
};

const workoutTypes = ["Strength", "Cardio", "HIIT", "Yoga", "Cycling", "Swimming", "Running", "Other"];
const intensityLabels = ["", "Easy", "Light", "Moderate", "Hard", "Max"];
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" };

export default function WorkoutsPage() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [form, setForm] = useState({ type: "Strength", duration_minutes: "", intensity: 3, notes: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadHistory() {
    const { data } = await supabase.from("workouts").select("*")
      .order("date", { ascending: false }).order("created_at", { ascending: false }).limit(20);
    setHistory(data ?? []);
  }

  useEffect(() => { loadHistory(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("workouts").insert({
      user_id: user.id, date: today, type: form.type,
      duration_minutes: parseInt(form.duration_minutes)||0,
      intensity: form.intensity, notes: form.notes||null,
    });
    if (!error) {
      setForm({ type: "Strength", duration_minutes: "", intensity: 3, notes: "" });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      await loadHistory();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("workouts").delete().eq("id", id);
    await loadHistory();
  }

  const todayWorkouts = history.filter((w) => w.date === today);
  const pastWorkouts = history.filter((w) => w.date !== today);

  return (
    <div className="space-y-6 relative">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)" }} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#4ade80" }}>Workouts</p>
        <h1 className="text-2xl font-bold text-white">Training Log</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm font-semibold text-white mb-5">Log a session</p>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all appearance-none"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                {workoutTypes.map((t) => <option key={t} style={{ background: "#0a130a" }}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>Duration (min)</label>
              <input type="number" min="1" required value={form.duration_minutes} placeholder="45"
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(156,163,175,0.7)" }}>
                Intensity — <span style={{ color: "#4ade80" }}>{intensityLabels[form.intensity]}</span>
              </label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((i) => (
                  <button key={i} type="button" onClick={() => setForm({ ...form, intensity: i })}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                    style={form.intensity === i
                      ? { background: "linear-gradient(135deg, #22c55e, #4ade80)", color: "white", boxShadow: "0 0 16px rgba(74,222,128,0.35)" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(107,114,128,1)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>Notes</label>
              <input type="text" value={form.notes} placeholder="e.g. PR on bench press"
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-white font-bold rounded-xl py-3 text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #22c55e, #14b8a6)", boxShadow: "0 0 24px rgba(34,197,94,0.3)" }}>
              {loading ? "Saving..." : saved ? "✓ Logged!" : "Log Workout"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="space-y-4">
          {todayWorkouts.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-sm font-semibold text-white mb-4">Today</p>
              <div className="space-y-2">
                {todayWorkouts.map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.12)" }}>
                    <div>
                      <p className="text-sm font-semibold text-white">{w.type}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(107,114,128,1)" }}>{w.duration_minutes} min</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} className="w-1 h-3.5 rounded-full"
                            style={{ background: i <= w.intensity ? "#4ade80" : "rgba(255,255,255,0.07)" }} />
                        ))}
                      </div>
                      <button onClick={() => handleDelete(w.id)}
                        className="text-xs transition-all px-2 py-1 rounded-lg"
                        style={{ color: "rgba(75,85,99,1)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "rgba(75,85,99,1)"; e.currentTarget.style.background = "transparent"; }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-sm font-semibold text-white mb-4">History</p>
            {pastWorkouts.length === 0 ? (
              <p className="text-sm" style={{ color: "rgba(75,85,99,1)" }}>No previous workouts yet.</p>
            ) : (
              <div className="space-y-1">
                {pastWorkouts.slice(0,10).map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div>
                      <p className="text-sm font-medium text-white">{w.type}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(107,114,128,1)" }}>{w.date} · {w.duration_minutes} min</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="w-1 h-3 rounded-full"
                          style={{ background: i <= w.intensity ? "#22c55e" : "rgba(255,255,255,0.06)" }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
