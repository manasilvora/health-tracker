"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SleepEntry = {
  id: string;
  date: string;
  duration_hours: number;
  quality: number;
  notes: string | null;
};

const qualityLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

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
      const { data: todayEntry } = await supabase
        .from("sleep").select("*").eq("date", today).single();

      if (todayEntry) {
        setEntry(todayEntry);
        setForm({
          duration_hours: String(todayEntry.duration_hours),
          quality: todayEntry.quality,
          notes: todayEntry.notes ?? "",
        });
      }

      const { data: hist } = await supabase
        .from("sleep").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("sleep")
      .upsert({
        user_id: user.id,
        date: today,
        duration_hours: parseFloat(form.duration_hours) || 0,
        quality: form.quality,
        notes: form.notes || null,
      }, { onConflict: "user_id,date" })
      .select().single();

    if (!error && data) {
      setEntry(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      const { data: hist } = await supabase
        .from("sleep").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Sleep</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Log Last Night&apos;s Sleep</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hours slept</label>
              <input type="number" min="0" max="24" step="0.25" value={form.duration_hours}
                onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="7.5" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Quality — <span className="text-indigo-400">{qualityLabels[form.quality]}</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((q) => (
                  <button key={q} type="button"
                    onClick={() => setForm({ ...form, quality: q })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      form.quality === q
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
              <input type="text" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. woke up twice, vivid dreams" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition">
              {loading ? "Saving..." : saved ? "Saved!" : entry ? "Update" : "Save"}
            </button>
          </form>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Last 7 Days</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No entries yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{h.date}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 w-5 rounded-full ${i <= h.quality ? "bg-indigo-500" : "bg-gray-700"}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-white font-semibold">{h.duration_hours}h</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
