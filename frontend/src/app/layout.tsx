import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import HeaderNav from "@/components/HeaderNav";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Patching Console",
  description:
    "Web console for scheduling, approving, and auditing database patches across VMs and Kubernetes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <QueryProvider>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-brand-600" />
                <span className="text-lg font-semibold text-slate-900">
                  Patching Console
                </span>
              </div>
              <HeaderNav />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
