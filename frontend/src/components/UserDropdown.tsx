"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, User, Settings } from "lucide-react";
import LogoutButton from "./LogoutButton";
import UserAvatar from "./UserAvatar";
import Link from "next/link";

export default function UserDropdown() {
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 transition"
      >
        <UserAvatar name={user.name} />

        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50">

          <div className="border-b p-4">
            <p className="font-semibold text-slate-900">
              {user.name}
            </p>

            <p className="text-sm text-slate-500">
              {user.email}
            </p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-3 hover:bg-slate-100 transition"
          >
            <User className="h-4 w-4" />
            My Profile
          </Link>

          <button className="flex w-full items-center gap-2 px-4 py-3 hover:bg-slate-100 transition">
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <div className="border-t">
            <LogoutButton />
          </div>

        </div>
      )}
    </div>
  );
}