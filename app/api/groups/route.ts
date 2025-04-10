import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { groupsApi } from "@/lib/api-client"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, members, avatar } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    // Create group via API
    const response = await groupsApi.create({
      userId: session.user.id,
      name,
      description,
      members,
      avatar,
    })

    if (!response.data || !response.data.data) {
      throw new Error("Failed to create group")
    }

    const groupId = response.data.data.groupId

    // Store group in local database for faster retrieval
    await prisma.group.create({
      data: {
        groupId,
        name,
        description: description || "",
        avatar: avatar || null,
        createdById: session.user.id,
        members: {
          create: [
            {
              userId: session.user.id,
              role: "admin",
            },
            ...(members || []).map((memberId: string) => ({
              userId: memberId,
              role: "member",
            })),
          ],
        },
      },
    })

    // Log activity for transparency
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Group Created",
        details: `Created group "${name}" with ${members?.length || 0} members`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Create group error:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's groups from API
    const response = await groupsApi.getUserGroups(session.user.id)

    if (!response.data) {
      throw new Error("Failed to get groups")
    }

    // Log activity for transparency
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "Groups Retrieved",
        details: "Retrieved user's groups",
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Get groups error:", error)
    return NextResponse.json({ error: "Failed to get groups" }, { status: 500 })
  }
}
