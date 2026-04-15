import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.API_key || "")

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const maxRetries = 2
    let lastError: any

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        return NextResponse.json({ prediction: text.trim() })
      } catch (error: any) {
        lastError = error
        if (error?.message?.includes("429") || error?.message?.includes("RATE_LIMIT_EXCEEDED")) {
          if (attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000
            console.warn(`Rate limited, retrying in ${waitTime}ms...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            continue
          }
        }
        console.error("Error generating AI prediction:", error)
        break
      }
    }

    return NextResponse.json({ prediction: "Unable to generate detailed prediction at this time. The API is currently busy. Please try again in a few moments." })
  } catch (error) {
    console.error("Error in prediction API:", error)
    return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
  }
}