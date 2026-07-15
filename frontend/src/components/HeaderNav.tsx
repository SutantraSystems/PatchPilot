"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Inventory", href: "/inventory" },
  { label: "Approvals", href: "/approvals" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        if (!item.href) {
          return (
            <span
              key={item.label}
              title="Coming soon"
              className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm font-medium text-slate-400"
            >
              {item.label}
            </span>
          );
        }

        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={
              isActive
                ? "rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
