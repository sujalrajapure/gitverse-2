import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.API_key || "")

export async function generateAIPrediction(prompt: string): Promise<string> {
  const maxRetries = 2
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      return text.trim()
    } catch (error: any) {
      lastError = error
      // Check for rate limit error
      if (error?.message?.includes("429") || error?.message?.includes("RATE_LIMIT_EXCEEDED")) {
        if (attempt < maxRetries - 1) {
          // Exponential backoff: wait 2^attempt seconds
          const waitTime = Math.pow(2, attempt) * 1000
          console.warn(`Rate limited, retrying in ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
      }
      // For other errors, give up immediately
      console.error("Error generating AI prediction:", error)
      break
    }
  }

  // Fallback response when rate limited or error occurs
  return "Unable to generate detailed prediction at this time. The API is currently busy. Please try again in a few moments."
}

export async function generateAISummary(data: any): Promise<string> {
  const maxRetries = 2

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })

      // Format repository data for the prompt
      const repoInfo = data.repoInfo
      const contributors = data.contributors
      const issues = data.issues
      const pullRequests = data.pullRequests

      // Calculate some metrics
      const openIssues = issues.filter((i: any) => i.state === "open").length
      const closedIssues = issues.filter((i: any) => i.state === "closed").length
      const mergedPRs = pullRequests.filter((pr: any) => pr.merged_at).length
      const openPRs = pullRequests.filter((pr: any) => !pr.merged_at && pr.state === "open").length

      // Create a prompt for Gemini
      const prompt = `
      Analyze this GitHub repository and provide a concise summary (max 250 words):
      
      Repository: ${repoInfo.full_name}
      Description: ${repoInfo.description || "No description provided"}
      
      Key Metrics:
      - Stars: ${repoInfo.stargazers_count}
      - Forks: ${repoInfo.forks_count}
      - Watchers: ${repoInfo.subscribers_count}
      - Open Issues: ${openIssues}
      - Closed Issues: ${closedIssues}
      - Open PRs: ${openPRs}
      - Merged PRs: ${mergedPRs}
      - Top Contributors: ${contributors
        .slice(0, 5)
        .map((c: any) => `${c.login} (${c.contributions} commits)`)
        .join(", ")}
      
      Please include:
      1. A brief overview of what the repository does
      2. Assessment of repository health based on activity metrics
      3. Observations about contributor activity
      4. 2-3 specific suggestions for improvement
      
      Format the response as a single paragraph without bullet points or sections.
      `

      // Generate the summary with a timeout
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini API request timed out")), 10000)),
      ]) as any

      const response = await result.response
      const text = response.text()
      return text.trim()
    } catch (apiError: any) {
      // Check if it's a rate limit error
      if (apiError?.message?.includes("429") || apiError?.message?.includes("RATE_LIMIT_EXCEEDED")) {
        console.warn(
          `Gemini API rate limited, attempt ${attempt + 1}/${maxRetries}:`,
          apiError
        )
        if (attempt < maxRetries - 1) {
          // Exponential backoff
          const waitTime = Math.pow(2, attempt) * 1000
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          continue
        }
      } else {
        console.warn("Gemini API error, using fallback summary:", apiError)
      }
      // Fall back to generated summary
      return generateFallbackSummary(data)
    }
  }

  // Final fallback
  return generateFallbackSummary(data)
}

// Generate a fallback summary based on repository data
function generateFallbackSummary(data: any): string {
  try {
    const { repoInfo, contributors, issues, pullRequests } = data

    // Calculate metrics
    const openIssues = issues.filter((i: any) => i.state === "open").length
    const closedIssues = issues.filter((i: any) => i.state === "closed").length
    const mergedPRs = pullRequests.filter((pr: any) => pr.merged_at).length
    const openPRs = pullRequests.filter((pr: any) => !pr.merged_at && pr.state === "open").length

    const issueResolutionRate = issues.length > 0 ? Math.round((closedIssues / issues.length) * 100) : 0

    const mergedPRsCount = pullRequests.filter((pr: any) => pr.merged_at).length
    const prMergeRate = pullRequests.length > 0 ? Math.round((mergedPRsCount / pullRequests.length) * 100) : 0

    const topContributors = contributors
      .slice(0, 3)
      .map((c) => c.login)
      .join(", ")

    // Determine activity level
    let activityLevel = "low"
    if (pullRequests.length > 20 || issues.length > 50) {
      activityLevel = "high"
    } else if (pullRequests.length > 10 || issues.length > 20) {
      activityLevel = "moderate"
    }

    // Determine health status
    let healthStatus = "needs improvement"
    if (issueResolutionRate > 70 && prMergeRate > 70) {
      healthStatus = "excellent"
    } else if (issueResolutionRate > 50 && prMergeRate > 50) {
      healthStatus = "good"
    }

    // Generate summary
    return `${repoInfo.full_name} is a repository with ${repoInfo.stargazers_count.toLocaleString()} stars and ${repoInfo.forks_count.toLocaleString()} forks. The repository shows ${activityLevel} activity with ${issues.length} total issues (${openIssues} open, ${closedIssues} closed) and ${pullRequests.length} pull requests. Key contributors include ${topContributors}. Based on metrics analysis, this repository appears to be in ${healthStatus} health with an issue resolution rate of ${issueResolutionRate}% and PR merge rate of ${prMergeRate}%. ${repoInfo.description ? `The repository is described as: "${repoInfo.description}"` : ""} Improvement areas could include ${openIssues > 10 ? "addressing the backlog of open issues" : "maintaining the current pace of development"}, ${contributors.length < 5 ? "expanding the contributor base" : "continuing to engage the active community"}, and ensuring documentation remains up-to-date.`
  } catch (error) {
    console.error("Error generating fallback summary:", error)
    return "Unable to generate a summary for this repository at this time. Please try again later."
  }
}

export async function analyzeRepositoryHealth(data: any): Promise<{ score: number; analysis: string }> {
  const maxRetries = 2

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })

      const { repoInfo, contributors, issues, pullRequests, heatmapData } = data

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
- Total Pull Requests: ${totalPRs} (Open: ${openPRs}, Merged: ${mergedPRs})
- PR Merge Rate: ${prMergeRate}%
- Active Contributors: ${uniqueContributors}
- Recent Commits (last year): ${recentCommits}
- Repository Age: ${Math.floor((Date.now() - new Date(repoInfo.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
- Watchers/Stars Ratio: ${(repoInfo.subscribers_count / Math.max(repoInfo.stargazers_count, 1) * 100).toFixed(2)}%
- Forks/Stars Ratio: ${(repoInfo.forks_count / Math.max(repoInfo.stargazers_count, 1) * 100).toFixed(2)}%
- Open Issues Ratio: ${((openIssues / Math.max(totalIssues, 1)) * 100).toFixed(2)}%
- Has Wiki: ${repoInfo.has_wiki ? "Yes" : "No"}
- Has Pages: ${repoInfo.has_pages ? "Yes" : "No"}
- Is Archived: ${repoInfo.archived ? "Yes" : "No"}
- Network Count: ${repoInfo.network_count}

Based on these metrics, provide:
1. A comprehensive health score (0-100) considering all factors
2. 3-4 sentences explaining the health assessment
3. Key strengths and areas for improvement

Format your response as JSON with this structure:
{
  "score": <number 0-100>,
  "analysis": "<detailed analysis explaining the score>"
}`

      const result = await Promise.race([
        model.generateContent(healthPrompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Health analysis request timed out")), 15000)
        ),
      ]) as any

      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      let parsedResponse
      try {
        // Extract JSON from the response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("No JSON found in response")
        }
      } catch (parseError) {
        console.warn("Could not parse health analysis JSON, using fallback:", parseError)
        // Fallback: extract score if mentioned
        const scoreMatch = text.match(/\b([0-9]{1,2})\b.*health|score|health.*([0-9]{1,2})/i)
        const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : generateFallbackHealthScore(data)
        return {
          score: Math.min(100, Math.max(0, score)),
          analysis: text.substring(0, 300),
        }
      }

      return {
        score: Math.min(100, Math.max(0, parsedResponse.score || 50)),
        analysis: parsedResponse.analysis || "Health analysis completed",
      }
    } catch (error: any) {
      // Check for rate limit error
      if (error?.message?.includes("429") || error?.message?.includes("RATE_LIMIT_EXCEEDED")) {
        console.warn(`Health analysis rate limited, attempt ${attempt + 1}/${maxRetries}:`, error)
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
      } else {
        console.warn("Error analyzing repository health:", error)
      }
      break
    }
  }

  // Fallback when API fails
  const fallbackScore = generateFallbackHealthScore(data)
  return {
    score: fallbackScore,
    analysis:
      "Health analysis unavailable at this time. Using baseline metrics: issue resolution rate, PR merge rate, contributor activity, and commit frequency.",
  }
}

function generateFallbackHealthScore(data: any): number {
  const { repoInfo, contributors, issues, pullRequests } = data

  const openIssues = issues.filter((i: any) => i.state === "open").length
  const closedIssues = issues.filter((i: any) => i.state === "closed").length
  const issueScore = closedIssues > 0 ? Math.min((closedIssues / (openIssues + closedIssues)) * 25, 25) : 0

  const mergedPRs = pullRequests.filter((pr: any) => pr.merged_at).length
  const prScore = mergedPRs > 0 ? Math.min((mergedPRs / Math.max(pullRequests.length, 1)) * 25, 25) : 0

  const starScore = Math.min((repoInfo.stargazers_count / 10000) * 25, 25)
  const contributorScore = Math.min((contributors.length / 50) * 25, 25)

  return Math.round(issueScore + prScore + starScore + contributorScore)
}

