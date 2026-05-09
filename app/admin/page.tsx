import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const adminSections: {
  href: string;
  label: string;
  description: string;
  icon: typeof BarChart3;
}[] = [
  {
    href: "/admin/analytics",
    label: "Traffic & analytics",
    description: "Page views, charts, top URLs.",
    icon: BarChart3,
  },
  {
    href: "/admin/quotes",
    label: "Quote requests",
    description: "STL quote checkout submissions from the site.",
    icon: FileText,
  },
];

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200">
            <Activity className="size-3.5" aria-hidden />
            Admin
          </p>
          <h1 className="mt-4 flex items-center gap-3 text-3xl font-semibold tracking-tight">
            <LayoutDashboard className="size-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Choose a section below. Links open in a <span className="font-medium text-zinc-800 dark:text-zinc-200">new tab</span>{" "}
            so you can keep this menu open.
          </p>
        </div>

        <ul className="space-y-3">
          {adminSections.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-500/40 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/35 dark:hover:bg-zinc-800/80"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                    <Icon className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.label}
                      <ExternalLink className="size-4 shrink-0 text-zinc-400" aria-hidden />
                    </span>
                    <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">{item.description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-wrap gap-2 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <LogOut className="size-4" aria-hidden />
              Logout
            </button>
          </form>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
