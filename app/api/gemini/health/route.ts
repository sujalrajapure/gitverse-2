import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.API_key || "")

export async function POST(request: NextRequest) {
  try {
    const { healthData } = await request.json()

    const maxRetries = 2

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const { repoInfo, contributors, issues, pullRequests, heatmapData } = healthData

        // Calculate foundational metrics
        const openIssues = issues.filter((i: any) => i.state === "open").length
        const closedIssues = issues.filter((i: any) => i.state === "closed").length
        const totalIssues = issues.length
        const issueResolutionRate = totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 0

        const openPRs = pullRequests.filter((pr: any) => !pr.merged_at && pr.state === "open").length
        const mergedPRs = pullRequests.filter((pr: any) => pr.merged_at).length
        const totalPRs = pullRequests.length
        const prMergeRate = totalPRs > 0 ? Math.round((mergedPRs / totalPRs) * 100) : 0

        const recentCommits = heatmapData?.length || 0
        const uniqueContributors = contributors.length

        // Create a detailed health analysis prompt
        const healthPrompt = `Analyze the health of this GitHub repository based on multiple factors and provide a health score (0-100) and detailed analysis:

Repository: ${repoInfo.full_name}
Stars: ${repoInfo.stargazers_count}
Forks: ${repoInfo.forks_count}
Watchers: ${repoInfo.subscribers_count}
Language: ${repoInfo.language || "Unknown"}
Created: ${new Date(repoInfo.created_at).toLocaleDateString()}
Last Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}

Metrics:
- Total Issues: ${totalIssues} (Open: ${openIssues}, Closed: ${closedIssues})
- Issue Resolution Rate: ${issueResolutionRate}%
- Total PRs: ${totalPRs} (Open: ${openPRs}, Merged: ${mergedPRs})
- PR Merge Rate: ${prMergeRate}%
- Unique Contributors: ${uniqueContributors}
- Recent Commits: ${recentCommits}

Contributors (top 5):
${contributors.slice(0, 5).map((c: any) => `- ${c.login}: ${c.contributions} contributions`).join('\n')}

Please provide:
1. A health score from 0-100 (where 100 is excellent health)
2. A detailed analysis paragraph explaining the score

Format your response as JSON:
{
  "score": <number>,
  "analysis": "<detailed analysis paragraph>"
}`

        const result = await model.generateContent(healthPrompt)
        const response = await result.response
        const text = response.text().trim()

        // Try to parse as JSON
        try {
          const parsed = JSON.parse(text)
          return NextResponse.json({ score: parsed.score, analysis: parsed.analysis })
        } catch {
          // If not JSON, extract score and analysis from text
          const scoreMatch = text.match(/score["\s:]*(\d+)/i)
          const score = scoreMatch ? parseInt(scoreMatch[1]) : 50
          return NextResponse.json({ score, analysis: text })
        }
      } catch (error: any) {
        if (error?.message?.includes("429") || error?.message?.includes("RATE_LIMIT_EXCEEDED")) {
          if (attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
        }
        console.error("Error analyzing repository health:", error)
        break
      }
    }

    // Fallback
    const score = 50
    const analysis = "Health analysis temporarily unavailable. Showing default metrics."
    return NextResponse.json({ score, analysis })
  } catch (error) {
    console.error("Error in health API:", error)
    return NextResponse.json({ error: "Failed to analyze repository health" }, { status: 500 })
  }
}