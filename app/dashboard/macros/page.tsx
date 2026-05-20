"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MacroEntry = {
  id: string;
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes: string | null;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: todayEntry } = await supabase
        .from("macros").select("*").eq("date", today).single();

      if (todayEntry) {
        setEntry(todayEntry);
        setForm({
          calories: String(todayEntry.calories),
          protein_g: String(todayEntry.protein_g),
          carbs_g: String(todayEntry.carbs_g),
          fat_g: String(todayEntry.fat_g),
          notes: todayEntry.notes ?? "",
        });
      }

      const { data: hist } = await supabase
        .from("macros").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      date: today,
      calories: parseInt(form.calories) || 0,
      protein_g: parseFloat(form.protein_g) || 0,
      carbs_g: parseFloat(form.carbs_g) || 0,
      fat_g: parseFloat(form.fat_g) || 0,
      notes: form.notes || null,
    };

    const { data, error } = await supabase
      .from("macros")
      .upsert(payload, { onConflict: "user_id,date" })
      .select()
      .single();

    if (!error && data) {
      setEntry(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      const { data: hist } = await supabase
        .from("macros").select("*").order("date", { ascending: false }).limit(7);
      setHistory(hist ?? []);
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Macros</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Log Today&apos;s Macros</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Calories (kcal)</label>
              <input type="number" min="0" value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="0" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-blue-400 mb-1">Protein (g)</label>
                <input type="number" min="0" step="0.1" value={form.protein_g}
                  onChange={(e) => setForm({ ...form, protein_g: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="0" />
              </div>
              <div>
                <label className="block text-sm text-yellow-400 mb-1">Carbs (g)</label>
                <input type="number" min="0" step="0.1" value={form.carbs_g}
                  onChange={(e) => setForm({ ...form, carbs_g: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="0" />
              </div>
              <div>
                <label className="block text-sm text-pink-400 mb-1">Fat (g)</label>
                <input type="number" min="0" step="0.1" value={form.fat_g}
                  onChange={(e) => setForm({ ...form, fat_g: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
              <input type="text" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="e.g. cheat day, high protein day" />
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
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="text-blue-400">{h.protein_g}g P</span> · <span className="text-yellow-400">{h.carbs_g}g C</span> · <span className="text-pink-400">{h.fat_g}g F</span>
                    </p>
                  </div>
                  <span className="text-white font-semibold">{h.calories} kcal</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
