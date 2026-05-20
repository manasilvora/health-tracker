import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split("T")[0];

  const [{ data: macros }, { data: sleep }, { data: workouts }] = await Promise.all([
    supabase.from("macros").select("*").eq("date", today).single(),
    supabase.from("sleep").select("*").eq("date", today).single(),
    supabase.from("workouts").select("*").eq("date", today).order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Today&apos;s Overview</h1>
        <p className="text-gray-400 mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Macros card */}
        <Link href="/dashboard/macros" className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/50 transition group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🥗</span>
            <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition">Log →</span>
          </div>
          <h2 className="text-gray-400 text-sm font-medium mb-3">Macros</h2>
          {macros ? (
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{macros.calories} <span className="text-sm font-normal text-gray-400">kcal</span></p>
              <div className="flex gap-3 text-sm text-gray-400 mt-2">
                <span className="text-blue-400">{macros.protein_g}g protein</span>
                <span className="text-yellow-400">{macros.carbs_g}g carbs</span>
                <span className="text-pink-400">{macros.fat_g}g fat</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Not logged yet</p>
          )}
        </Link>

        {/* Sleep card */}
        <Link href="/dashboard/sleep" className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/50 transition group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">😴</span>
            <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition">Log →</span>
          </div>
          <h2 className="text-gray-400 text-sm font-medium mb-3">Sleep</h2>
          {sleep ? (
            <div>
              <p className="text-2xl font-bold text-white">{sleep.duration_hours}h</p>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-2 w-6 rounded-full ${i <= sleep.quality ? "bg-indigo-500" : "bg-gray-700"}`} />
                ))}
                <span className="text-gray-400 text-xs ml-2">quality</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Not logged yet</p>
          )}
        </Link>

        {/* Workouts card */}
        <Link href="/dashboard/workouts" className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/50 transition group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">💪</span>
            <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition">Log →</span>
          </div>
          <h2 className="text-gray-400 text-sm font-medium mb-3">Workouts</h2>
          {workouts && workouts.length > 0 ? (
            <div>
              <p className="text-2xl font-bold text-white">{workouts.length} <span className="text-sm font-normal text-gray-400">session{workouts.length > 1 ? "s" : ""}</span></p>
              <p className="text-gray-400 text-sm mt-1">{workouts.reduce((sum, w) => sum + w.duration_minutes, 0)} min total</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Not logged yet</p>
          )}
        </Link>
      </div>
    </div>
  );
}
