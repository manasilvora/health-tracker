import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function MacroBar({ label, value, max, from, to }: { label: string; value: number; max: number; from: string; to: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "rgba(156,163,175,0.8)" }}>{label}</span>
        <span className="font-medium text-white">{value}g</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${from}, ${to})` }} />
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
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ring-grad)" strokeWidth={stroke}
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

  const cardStyle = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" };

  return (
    <div className="space-y-8 relative">
      {/* Orbs */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)" }} />

      {/* Header */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: "#4ade80" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-bold text-white">
          {getGreeting()}, <span className="gradient-text">{name}</span> 👋
        </h1>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Calories", val: macros?.calories, unit: "kcal", color: "#22c55e", logged: !!macros },
          { label: "Sleep", val: sleep?.duration_hours, unit: "hrs", color: "#14b8a6", logged: !!sleep },
          { label: "Workouts", val: workouts?.length || undefined, unit: "sessions", color: "#4ade80", logged: !!(workouts?.length) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(107,114,128,1)" }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.logged ? s.color : "rgba(55,65,81,1)" }}>
              {s.logged ? s.val : "—"}
              {s.logged && <span className="text-sm font-normal ml-1" style={{ color: "rgba(107,114,128,1)" }}>{s.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Macros */}
        <Link href="/dashboard/macros" className="rounded-2xl p-5 block transition-all hover:border-green-500/30 hover:bg-green-500/[0.02]"
          style={cardStyle}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#22c55e" }}>Macros</p>
              <p className="font-semibold text-white">Today&apos;s intake</p>
            </div>
            <span className="text-xs" style={{ color: "rgba(75,85,99,1)" }}>Log →</span>
          </div>
          {macros ? (
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <RingProgress pct={calPct} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold text-sm">{calPct}%</span>
                  <span className="text-xs" style={{ color: "rgba(107,114,128,1)" }}>goal</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                <MacroBar label="Protein" value={macros.protein_g} max={150} from="#22c55e" to="#4ade80" />
                <MacroBar label="Carbs" value={macros.carbs_g} max={250} from="#14b8a6" to="#2dd4bf" />
                <MacroBar label="Fat" value={macros.fat_g} max={70} from="#10b981" to="#6ee7b7" />
              </div>
            </div>
          ) : (
            <EmptyState emoji="🥗" label="Log macros" color="rgba(34,197,94" />
          )}
        </Link>

        {/* Sleep */}
        <Link href="/dashboard/sleep" className="rounded-2xl p-5 block transition-all hover:border-teal-500/30 hover:bg-teal-500/[0.02]"
          style={cardStyle}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#14b8a6" }}>Sleep</p>
              <p className="font-semibold text-white">Last night</p>
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
                <p className="text-xs mb-2" style={{ color: "rgba(107,114,128,1)" }}>Quality</p>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="h-2 flex-1 rounded-full"
                      style={{ background: i <= sleep.quality ? "linear-gradient(90deg,#14b8a6,#2dd4bf)" : "rgba(255,255,255,0.05)" }} />
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: "#14b8a6" }}>
                  {["","Poor","Fair","Good","Great","Excellent"][sleep.quality]}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState emoji="😴" label="Log sleep" color="rgba(20,184,166" />
          )}
        </Link>

        {/* Workouts */}
        <Link href="/dashboard/workouts" className="rounded-2xl p-5 block transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
          style={cardStyle}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#4ade80" }}>Workouts</p>
              <p className="font-semibold text-white">Today&apos;s sessions</p>
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
                    style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)" }}>
                    <span className="text-sm text-white">{w.type}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="w-1 h-3 rounded-full"
                          style={{ background: i <= w.intensity ? "#4ade80" : "rgba(255,255,255,0.07)" }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState emoji="💪" label="Log workout" color="rgba(74,222,128" />
          )}
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-20 rounded-xl gap-1.5"
      style={{ background: `${color},0.03)`, border: `1px dashed ${color},0.18)` }}>
      <span className="text-xl">{emoji}</span>
      <span className="text-xs font-medium" style={{ color: `${color},0.5)` }}>{label}</span>
    </div>
  );
}
