import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const cookieToken = request.cookies.get("github-access-token")?.value
  const envToken = process.env.GITHUB_TOKEN?.trim()
  const authToken = cookieToken || (envToken && envToken !== "undefined" && envToken !== "null" ? envToken : undefined)

  if (!authToken) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${authToken}`,
    }

    // Fetch user profile
    const userResponse = await fetch("https://api.github.com/user", { headers })
    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: userResponse.status })
    }
    const user = await userResponse.json()

    // Fetch user repositories
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=100&type=all`,
      { headers }
    )
    if (!reposResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: reposResponse.status })
    }
    const repos = await reposResponse.json()

    return NextResponse.json({ user, repos })
  } catch (error) {
    console.error("Error fetching user repositories:", error)
    return NextResponse.json(
      { error: "Failed to fetch user repositories" },
      { status: 500 }
    )
  }
}