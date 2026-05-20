"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MacroEntry = {
  id: string; date: string; calories: number;
  protein_g: number; carbs_g: number; fat_g: number; notes: string | null;
};

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
};

export default function MacrosPage() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const [entry, setEntry] = useState<MacroEntry | null>(null);
  const [history, setHistory] = useState<MacroEntry[]>([]);
  const [form, setForm] = useState({ calories: "", protein_g: "", carbs_g: "", fat_g: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: todayEntry } = await supabase.from("macros").select("*").eq("date", today).single();
      if (todayEntry) {
        setEntry(todayEntry);
        setForm({ calories: String(todayEntry.calories), protein_g: String(todayEntry.protein_g),
          carbs_g: String(todayEntry.carbs_g), fat_g: String(todayEntry.fat_g), notes: todayEntry.notes ?? "" });
      }
      const { data: hist } = await supabase.from("macros").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("macros")
      .upsert({ user_id: user.id, date: today, calories: parseInt(form.calories)||0,
        protein_g: parseFloat(form.protein_g)||0, carbs_g: parseFloat(form.carbs_g)||0,
        fat_g: parseFloat(form.fat_g)||0, notes: form.notes||null }, { onConflict: "user_id,date" })
      .select().single();
    if (!error && data) {
      setEntry(data); setSaved(true); setTimeout(() => setSaved(false), 2000);
      const { data: hist } = await supabase.from("macros").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    setLoading(false);
  }

  const macroFields = [
    { key: "protein_g", label: "Protein", color: "#22c55e", max: 150 },
    { key: "carbs_g", label: "Carbs", color: "#14b8a6", max: 250 },
    { key: "fat_g", label: "Fat", color: "#4ade80", max: 70 },
  ];

  return (
    <div className="space-y-6 relative">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)" }} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>Macros</p>
        <h1 className="text-2xl font-bold text-white">Today&apos;s Nutrition</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm font-semibold text-white mb-5">Log intake</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>
                Calories (kcal)
              </label>
              <input type="number" min="0" value={form.calories} placeholder="0"
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {macroFields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: f.color }}>
                    {f.label}
                  </label>
                  <input type="number" min="0" step="0.1" placeholder="0"
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-xl px-3 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = `${f.color}80`}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.7)" }}>
                Notes
              </label>
              <input type="text" value={form.notes} placeholder="e.g. cheat day, high protein day"
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(34,197,94,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-white font-bold rounded-xl py-3 text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #22c55e, #14b8a6)", boxShadow: "0 0 24px rgba(34,197,94,0.3)" }}>
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
                <div key={h.id} className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div>
                    <p className="text-sm font-medium text-white">{h.date}</p>
                    <p className="text-xs mt-0.5">
                      <span style={{ color: "#22c55e" }}>{h.protein_g}g P</span>
                      <span style={{ color: "rgba(107,114,128,1)" }}> · </span>
                      <span style={{ color: "#14b8a6" }}>{h.carbs_g}g C</span>
                      <span style={{ color: "rgba(107,114,128,1)" }}> · </span>
                      <span style={{ color: "#4ade80" }}>{h.fat_g}g F</span>
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#22c55e" }}>{h.calories} <span className="font-normal text-xs" style={{ color: "rgba(107,114,128,1)" }}>kcal</span></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
