"use client";

import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";
import { Mail, Shield, User } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="mx-auto max-w-4xl p-8">

      <h1 className="mb-8 text-3xl font-bold text-slate-900">
        My Profile
      </h1>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}

        <div className="flex items-center gap-6 border-b p-8">

          <UserAvatar
            name={session.user?.name ?? "User"}
          />

          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {session.user?.name}
            </h2>

            <p className="mt-1 text-slate-500">
              {session.user?.email}
            </p>
          </div>

        </div>

        {/* Details */}

        <div className="space-y-6 p-8">

          <div className="flex items-center justify-between border-b pb-4">

            <div className="flex items-center gap-3">

              <User className="h-5 w-5 text-brand-600" />

              <span className="font-medium">
                Full Name
              </span>

            </div>

            <span className="text-slate-600">
              {session.user?.name}
            </span>

          </div>

          <div className="flex items-center justify-between border-b pb-4">

            <div className="flex items-center gap-3">

              <Mail className="h-5 w-5 text-brand-600" />

              <span className="font-medium">
                Email
              </span>

            </div>

            <span className="text-slate-600">
              {session.user?.email}
            </span>

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Shield className="h-5 w-5 text-brand-600" />

              <span className="font-medium">
                Authentication
              </span>

            </div>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              Keycloak SSO
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}