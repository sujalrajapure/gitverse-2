import { NextResponse } from "next/server"

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"

export function GET(request: Request) {
  const url = new URL(request.url)
  const redirect = url.searchParams.get("redirect") || "/"

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${url.origin}/api/auth/callback/github`,
    scope: "read:user",
    state: encodeURIComponent(redirect),
  })

  const authUrl = `${GITHUB_AUTH_URL}?${params.toString()}`
  return NextResponse.redirect(authUrl)
}