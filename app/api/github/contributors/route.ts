import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get("owner")
  const repo = searchParams.get("repo")

  if (!owner || !repo) {
    return NextResponse.json({ error: "Owner and repo parameters are required" }, { status: 400 })
  }

  try {
    const cookieToken = request.cookies.get("github-access-token")?.value
    const envToken = process.env.GITHUB_TOKEN?.trim()
    const authToken = cookieToken || (envToken && envToken !== "undefined" && envToken !== "null" ? envToken : undefined)

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    }
    if (authToken) {
      headers.Authorization = `token ${authToken}`
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, {
      headers,
    })

    if (response.status === 401 && authToken) {
      const fallbackResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      })
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json()
        return NextResponse.json(data)
      }
      const errorData = await fallbackResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: `GitHub API error: ${fallbackResponse.status}`,
          message: errorData.message || "Unauthorized GitHub token",
        },
        { status: fallbackResponse.status },
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: `GitHub API error: ${response.status}`,
          message: errorData.message || "Unknown error",
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching contributors data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch contributors data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

