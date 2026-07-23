"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
    return (
        <button
            onClick={() => signIn("keycloak", {
                callbackUrl: "/",
            })}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
            Login
        </button>
    );
}