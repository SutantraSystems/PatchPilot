"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {

  const handleLogout = () => {
    signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="
        flex w-full items-center gap-2
        px-4 py-3
        text-red-600
        hover:bg-red-50
        transition
      "
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}