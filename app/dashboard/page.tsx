import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{value}g</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RingProgress({ pct, size = 64, stroke = 5, color = "#6366f1" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, pct / 100));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: macros }, { data: sleep }, { data: workouts }] = await Promise.all([
    supabase.from("macros").select("*").eq("date", today).single(),
    supabase.from("sleep").select("*").eq("date", today).single(),
    supabase.from("workouts").select("*").eq("date", today).order("created_at", { ascending: false }),
  ]);

  const calGoal = 2000;
  const calPct = macros ? Math.min(100, Math.round((macros.calories / calGoal) * 100)) : 0;
  const name = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-gray-500 text-sm mb-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="text-3xl font-bold text-white">{getGreeting()}, {name} 👋</h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Calories", value: macros ? `${macros.calories}` : "—", unit: "kcal", color: "text-indigo-400", logged: !!macros },
          { label: "Sleep", value: sleep ? `${sleep.duration_hours}` : "—", unit: "hrs", color: "text-violet-400", logged: !!sleep },
          { label: "Workouts", value: workouts?.length ? `${workouts.length}` : "—", unit: "sessions", color: "text-sky-400", logged: !!(workouts?.length) },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.logged ? s.color : "text-gray-600"}`}>
              {s.value} <span className="text-sm font-normal text-gray-500">{s.logged ? s.unit : ""}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Macros card */}
        <Link href="/dashboard/macros" className="group bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.05] rounded-2xl p-5 transition-all">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Macros</p>
              <p className="text-white font-semibold mt-0.5">Today&apos;s intake</p>
            </div>
            <span className="text-xs text-gray-600 group-hover:text-indigo-400 transition">Log →</span>
          </div>

          {macros ? (
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <RingProgress pct={calPct} size={72} stroke={6} color="#6366f1" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-sm leading-none">{calPct}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                <MacroBar label="Protein" value={macros.protein_g} max={150} color="bg-blue-400" />
                <MacroBar label="Carbs" value={macros.carbs_g} max={250} color="bg-yellow-400" />
                <MacroBar label="Fat" value={macros.fat_g} max={70} color="bg-pink-400" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
              <span className="text-gray-600 text-sm">Tap to log macros</span>
            </div>
          )}
        </Link>

        {/* Sleep card */}
        <Link href="/dashboard/sleep" className="group bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.05] rounded-2xl p-5 transition-all">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sleep</p>
              <p className="text-white font-semibold mt-0.5">Last night</p>
            </div>
            <span className="text-xs text-gray-600 group-hover:text-violet-400 transition">Log →</span>
          </div>

          {sleep ? (
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{sleep.duration_hours}</span>
                <span className="text-gray-400 mb-1">hours</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Quality</p>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= sleep.quality ? "bg-violet-500" : "bg-white/5"}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{["","Poor","Fair","Good","Great","Excellent"][sleep.quality]}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
              <span className="text-gray-600 text-sm">Tap to log sleep</span>
            </div>
          )}
        </Link>

        {/* Workouts card */}
        <Link href="/dashboard/workouts" className="group bg-white/[0.03] border border-white/[0.06] hover:border-sky-500/30 hover:bg-white/[0.05] rounded-2xl p-5 transition-all">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Workouts</p>
              <p className="text-white font-semibold mt-0.5">Today&apos;s sessions</p>
            </div>
            <span className="text-xs text-gray-600 group-hover:text-sky-400 transition">Log →</span>
          </div>

          {workouts && workouts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{workouts.reduce((s, w) => s + w.duration_minutes, 0)}</span>
                <span className="text-gray-400 mb-1">min</span>
              </div>
              <div className="space-y-1.5">
                {workouts.slice(0,2).map((w) => (
                  <div key={w.id} className="flex items-center justify-between bg-white/[0.04] rounded-lg px-3 py-1.5">
                    <span className="text-sm text-gray-300">{w.type}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`w-1 h-3 rounded-full ${i <= w.intensity ? "bg-sky-400" : "bg-white/10"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 rounded-xl bg-white/[0.02] border border-dashed border-white/10">
              <span className="text-gray-600 text-sm">Tap to log workout</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
