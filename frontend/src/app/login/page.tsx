// import { useSession } from "next-auth/react";
// import { redirect } from "next/navigation";
import { signIn } from "@/auth/auth";
import { ShieldCheck } from "lucide-react";

export default async function LoginPage() {

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-brand-50 p-4">
            <ShieldCheck className="h-10 w-10 text-brand-600" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            PatchPilot
          </h1>

          <p className="mt-3 text-center text-slate-500">
            Secure Database Patching Platform
          </p>

          <form
            action={async () => {
              "use server";

              await signIn("keycloak", {
                redirectTo: "/",
              });
            }}
            className="mt-8 w-full"
          >
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-4 py-3 text-white transition hover:bg-brand-700"
            >
              Login with Keycloak
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}