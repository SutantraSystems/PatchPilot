"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import UserMenu from "./UserMenu";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Inventory", href: "/inventory" },
  { label: "Approvals", href: "/approvals" },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLoginPage = pathname === "/login";

  return (
    <div className="flex items-center gap-6">
      {/* Navigation */}
      {!isLoginPage && session && (
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

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
      )}

      {/* Right Side */}
      {!isLoginPage &&
        (session ? (
          <UserMenu />
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Login
          </Link>
        ))}
    </div>
  );
}