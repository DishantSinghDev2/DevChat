import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, apiKey } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use user's API key if provided, otherwise use the app's key
    const key = apiKey || process.env.GEMINI_API_KEY

    if (!key) {
      return NextResponse.json({ error: "No API key available" }, { status: 400 })
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Generate response with safety settings
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }

    const safetySettings = [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ]

    // Generate content with safety settings
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    })

    const response = result.response
    const text = response.text()

    // Log AI interaction for transparency
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "AI Interaction",
        details: `Generated AI response for prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}"`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({ data: text })
  } catch (error) {
    console.error("AI error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate AI response",
      },
      { status: 500 },
    )
  }
}
