import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE_NAME = "github-access-token"

const isProtectedPath = (pathname: string) => {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/api/github") || pathname.startsWith("/profile")
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (cookieValue) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/github/:path*"],
}
