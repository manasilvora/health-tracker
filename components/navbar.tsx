"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/macros", label: "Macros" },
  { href: "/dashboard/sleep", label: "Sleep" },
  { href: "/dashboard/workouts", label: "Workouts" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl"
      style={{ background: "rgba(5,8,22,0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #22d3ee, #a855f7)" }}>H</div>
            <span className="font-bold text-white tracking-tight">HealthTrack</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={pathname === link.href
                  ? { background: "rgba(34,211,238,0.12)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }
                  : { color: "rgba(156,163,175,1)", border: "1px solid transparent" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleSignOut}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{ color: "#9ca3af" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#22d3ee"; e.currentTarget.style.background = "rgba(34,211,238,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
