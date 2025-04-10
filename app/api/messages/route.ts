import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { encryptMessage } from "@/lib/encryption"
import { messagesApi } from "@/lib/api-client"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      recipientId,
      content,
      type = "text",
      mediaId = null,
      replyToId = null,
      selfDestruct = false,
      selfDestructTime = null,
    } = await req.json()

    if (!recipientId || !content) {
      return NextResponse.json({ error: "Recipient ID and content are required" }, { status: 400 })
    }

    // Encrypt message content
    const encryptedContent = await encryptMessage(content)

    // Send message via API
    const response = await messagesApi.send({
      senderId: session.user.id,
      recipientId,
      content: encryptedContent,
      type,
      mediaId,
      replyToId,
      selfDestruct,
      selfDestructTime,
    })

    if (!response.data || !response.data.data) {
      throw new Error("Failed to send message")
    }

    const messageId = response.data.data.messageId

    // Store message in local database for faster retrieval
    await prisma.message.create({
      data: {
        messageId,
        senderId: session.user.id,
        recipientId,
        content: encryptedContent,
        type,
        mediaId,
        replyToId,
        status: "sent",
        sentAt: new Date(),
      },
    })

    // Log activity for transparency
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Message Sent",
        details: `Sent a ${type} message to user ${recipientId}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const recipientId = url.searchParams.get("recipientId")

    if (!recipientId) {
      return NextResponse.json({ error: "Recipient ID is required" }, { status: 400 })
    }

    // Get messages from API
    const response = await messagesApi.getChat(session.user.id, recipientId)

    if (!response.data || !response.data.data) {
      throw new Error("Failed to get messages")
    }

    // Log activity for transparency
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Messages Retrieved",
        details: `Retrieved chat history with user ${recipientId}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 })
  }
}
