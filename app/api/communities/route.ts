import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { apiClient } from "@/lib/api-client"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, isPrivate, avatar, coverImage } = await req.json()

    // Create community via API
    const response = await apiClient.post("/api/communities/create", {
      userId: session.user.id,
      name,
      description,
      isPrivate,
      avatar,
      coverImage,
    })

    // Store community in local database for faster retrieval
    await prisma.community.create({
      data: {
        communityId: response.data.data.communityId,
        name,
        description: description || "",
        avatar: avatar || null,
        coverImage: coverImage || null,
        isPrivate: isPrivate || false,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Create community error:", error)
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's communities from API
    const response = await apiClient.get(`/api/communities/user/${session.user.id}`)

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Get communities error:", error)
    return NextResponse.json({ error: "Failed to get communities" }, { status: 500 })
  }
}
