// Last edited by you@example.com @ 22/09/26 10:36.
// middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Admin login page should always be accessible
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("adminToken")?.value;

    // No cookie -> redirect to login
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Verify JWT properly
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

      // Check admin role
      if (decoded.role !== "admin") {
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url),
        );

        response.cookies.delete("adminToken");

        return response;
      }

      // Token is valid and user is admin
      return NextResponse.next();
    } catch (error) {
      console.error("Admin JWT verification failed:", error.message);

      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );

      response.cookies.delete("adminToken");

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
