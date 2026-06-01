import { NextResponse } from "next/server";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8")
    );
    return decoded;
  } catch (e) {
    return null;
  }
}

export function middleware(req) {
  const token = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;

  const publicPaths = [
    "/home",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Root → redirect based on auth state
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // No token on protected route → send to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Token exists → validate expiry
  if (token) {
    const payload = decodeJwt(token);

    if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("auth-token");
      return response;
    }

    // Logged-in user shouldn't access public routes
    if (isPublicPath) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/predict",
    "/predict/:path*",
    "/metrics",
    "/metrics/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};