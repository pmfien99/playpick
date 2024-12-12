import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("admin-auth")?.value === "true";

  if (!isAuthenticated && !request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], 
};