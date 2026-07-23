import { auth } from "@/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;

  const pathname = req.nextUrl.pathname;

  const isLoginPage = pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/jobs/:path*",
    "/inventory/:path*",
    "/approvals/:path*",
  ],
};