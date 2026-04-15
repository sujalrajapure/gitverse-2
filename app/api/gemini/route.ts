import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.API_key || "")

export async function POST(request: NextRequest) {
  try {
    const { summaryData } = await request.json()

    const maxRetries = 2

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        // Format repository data for the prompt
        const repoInfo = summaryData.repoInfo
        const contributors = summaryData.contributors
        const issues = summaryData.issues
        const pullRequests = summaryData.pullRequests

        const prompt = `Provide a comprehensive summary of this GitHub repository based on the following data:

Repository: ${repoInfo.full_name}
Description: ${repoInfo.description || 'No description available'}
Stars: ${repoInfo.stargazers_count}
Forks: ${repoInfo.forks_count}
Open Issues: ${repoInfo.open_issues_count}
Language: ${repoInfo.language || 'Not specified'}

Contributors (${contributors.length}):
${contributors.map((c: any) => `- ${c.login}: ${c.contributions} contributions`).join('\n')}

Recent Issues (${issues.length}):
${issues.slice(0, 10).map((i: any) => `- ${i.title} (${i.state})`).join('\n')}

Recent Pull Requests (${pullRequests.length}):
${pullRequests.slice(0, 10).map((pr: any) => `- ${pr.title} (${pr.state})`).join('\n')}

Please provide a detailed analysis including:
1. Overall project health and activity level
2. Key contributors and their impact
3. Current issues and development focus
4. Community engagement metrics
5. Recommendations for improvement

Keep the summary concise but informative.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        return NextResponse.json({ summary: text.trim() })
      } catch (error: any) {
        if (error?.message?.includes("429") || error?.message?.includes("RATE_LIMIT_EXCEEDED")) {
          if (attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
        }
        console.error("Error generating AI summary:", error)
        break
      }
    }

    return NextResponse.json({ summary: "Unable to generate AI summary at this time. Please try again later." })
  } catch (error) {
    console.error("Error in summary API:", error)
    return NextResponse.json({ error: "Failed to generate AI summary" }, { status: 500 })
  }
}

