import { NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "github-access-token"

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url))
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  })
  return response
}
