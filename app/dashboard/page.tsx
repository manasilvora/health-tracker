import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-medium">{value}g</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function RingProgress({ pct, size = 72, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, pct / 100));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
        stroke="url(#ring-gradient)" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
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
    <div className="space-y-8 relative">
      {/* Background orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)" }} />

      {/* Header */}
      <div>
        <p className="text-sm mb-1" style={{ color: "#22d3ee" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-bold text-white">{getGreeting()}, <span className="gradient-text">{name}</span> 👋</h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Calories", value: macros?.calories, unit: "kcal", color: "#22d3ee", logged: !!macros },
          { label: "Sleep", value: sleep?.duration_hours, unit: "hrs", color: "#a855f7", logged: !!sleep },
          { label: "Workouts", value: workouts?.length || undefined, unit: "sessions", color: "#06b6d4", logged: !!(workouts?.length) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(156,163,175,0.8)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.logged ? s.color : "rgba(75,85,99,1)" }}>
              {s.logged ? s.value : "—"}
              {s.logged && <span className="text-sm font-normal ml-1.5" style={{ color: "rgba(107,114,128,1)" }}>{s.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Macros */}
        <Link href="/dashboard/macros" className="group rounded-2xl p-5 transition-all block"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={() => {}} >
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#22d3ee" }}>Macros</p>
              <p className="text-white font-semibold">Today&apos;s intake</p>
            </div>
            <span className="text-xs transition" style={{ color: "rgba(75,85,99,1)" }}>Log →</span>
          </div>
          {macros ? (
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <RingProgress pct={calPct} size={72} stroke={6} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-sm leading-none">{calPct}%</span>
                  <span className="text-xs" style={{ color: "rgba(107,114,128,1)" }}>goal</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                <MacroBar label="Protein" value={macros.protein_g} max={150} color="linear-gradient(90deg,#22d3ee,#06b6d4)" />
                <MacroBar label="Carbs" value={macros.carbs_g} max={250} color="linear-gradient(90deg,#f59e0b,#fbbf24)" />
                <MacroBar label="Fat" value={macros.fat_g} max={70} color="linear-gradient(90deg,#ec4899,#f472b6)" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 rounded-xl gap-2"
              style={{ background: "rgba(34,211,238,0.03)", border: "1px dashed rgba(34,211,238,0.15)" }}>
              <span className="text-2xl">🥗</span>
              <span className="text-xs" style={{ color: "rgba(34,211,238,0.5)" }}>Tap to log macros</span>
            </div>
          )}
        </Link>

        {/* Sleep */}
        <Link href="/dashboard/sleep" className="group rounded-2xl p-5 transition-all block"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#a855f7" }}>Sleep</p>
              <p className="text-white font-semibold">Last night</p>
            </div>
            <span className="text-xs" style={{ color: "rgba(75,85,99,1)" }}>Log →</span>
          </div>
          {sleep ? (
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{sleep.duration_hours}</span>
                <span className="mb-1" style={{ color: "rgba(156,163,175,1)" }}>hours</span>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: "rgba(107,114,128,1)" }}>Quality score</p>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="h-2 flex-1 rounded-full"
                      style={{ background: i <= sleep.quality ? "linear-gradient(90deg,#8b5cf6,#a855f7)" : "rgba(255,255,255,0.05)" }} />
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: "#a855f7" }}>
                  {["","Poor","Fair","Good","Great","Excellent"][sleep.quality]}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 rounded-xl gap-2"
              style={{ background: "rgba(168,85,247,0.03)", border: "1px dashed rgba(168,85,247,0.15)" }}>
              <span className="text-2xl">😴</span>
              <span className="text-xs" style={{ color: "rgba(168,85,247,0.5)" }}>Tap to log sleep</span>
            </div>
          )}
        </Link>

        {/* Workouts */}
        <Link href="/dashboard/workouts" className="group rounded-2xl p-5 transition-all block"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#06b6d4" }}>Workouts</p>
              <p className="text-white font-semibold">Today&apos;s sessions</p>
            </div>
            <span className="text-xs" style={{ color: "rgba(75,85,99,1)" }}>Log →</span>
          </div>
          {workouts && workouts.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{workouts.reduce((s,w) => s+w.duration_minutes,0)}</span>
                <span className="mb-1" style={{ color: "rgba(156,163,175,1)" }}>min</span>
              </div>
              <div className="space-y-1.5">
                {workouts.slice(0,2).map((w) => (
                  <div key={w.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)" }}>
                    <span className="text-sm text-white">{w.type}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="w-1 h-3 rounded-full"
                          style={{ background: i <= w.intensity ? "#06b6d4" : "rgba(255,255,255,0.08)" }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 rounded-xl gap-2"
              style={{ background: "rgba(6,182,212,0.03)", border: "1px dashed rgba(6,182,212,0.15)" }}>
              <span className="text-2xl">💪</span>
              <span className="text-xs" style={{ color: "rgba(6,182,212,0.5)" }}>Tap to log workout</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
