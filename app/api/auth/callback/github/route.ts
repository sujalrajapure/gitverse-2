import { NextResponse } from "next/server"

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url))
  }

  const redirect = decodeURIComponent(state || "/profile")

  try {
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.redirect(new URL("/login?error=github_oauth_error", request.url))
    }

    const accessToken = tokenData.access_token

    // Store the access token in a cookie
    const response = NextResponse.redirect(new URL(redirect, request.url))
    response.cookies.set("github-access-token", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=server_error", request.url))
  }
}