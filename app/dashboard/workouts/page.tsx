"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WorkoutEntry = {
  id: string;
  date: string;
  type: string;
  duration_minutes: number;
  intensity: number;
  notes: string | null;
};

const workoutTypes = ["Strength", "Cardio", "HIIT", "Yoga", "Cycling", "Swimming", "Running", "Other"];
const intensityLabels = ["", "Easy", "Light", "Moderate", "Hard", "Max"];

export default function WorkoutsPage() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [form, setForm] = useState({ type: "Strength", duration_minutes: "", intensity: 3, notes: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadHistory() {
    const { data } = await supabase
      .from("workouts").select("*").order("date", { ascending: false }).order("created_at", { ascending: false }).limit(20);
    setHistory(data ?? []);
  }

  useEffect(() => { loadHistory(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("workouts").insert({
      user_id: user.id,
      date: today,
      type: form.type,
      duration_minutes: parseInt(form.duration_minutes) || 0,
      intensity: form.intensity,
      notes: form.notes || null,
    });

    if (!error) {
      setForm({ type: "Strength", duration_minutes: "", intensity: 3, notes: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await loadHistory();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("workouts").delete().eq("id", id);
    await loadHistory();
  }

  const todayWorkouts = history.filter((w) => w.date === today);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Workouts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Log a Workout</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition">
                {workoutTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Duration (minutes)</label>
              <input type="number" min="1" value={form.duration_minutes} required
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="45" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Intensity — <span className="text-indigo-400">{intensityLabels[form.intensity]}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button"
                    onClick={() => setForm({ ...form, intensity: i })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      form.intensity === i
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
              <input type="text" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. PR on bench press, felt strong" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition">
              {loading ? "Saving..." : saved ? "Saved!" : "Log Workout"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {todayWorkouts.length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-white font-semibold mb-3">Today</h2>
              <div className="space-y-2">
                {todayWorkouts.map((w) => (
                  <div key={w.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{w.type}</p>
                      <p className="text-gray-400 text-xs">{w.duration_minutes} min · intensity {w.intensity}/5</p>
                    </div>
                    <button onClick={() => handleDelete(w.id)} className="text-gray-600 hover:text-red-400 transition text-sm">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-white font-semibold mb-3">Recent History</h2>
            {history.filter((w) => w.date !== today).length === 0 ? (
              <p className="text-gray-500 text-sm">No previous workouts.</p>
            ) : (
              <div className="space-y-2">
                {history.filter((w) => w.date !== today).slice(0, 10).map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{w.type}</p>
                      <p className="text-gray-500 text-xs">{w.date} · {w.duration_minutes} min</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 w-3 rounded-full ${i <= w.intensity ? "bg-indigo-500" : "bg-gray-700"}`} />
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
