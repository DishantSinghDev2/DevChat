import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get user's activity logs with pagination
    const logs = await prisma.activityLog.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      skip,
    })

    // Get total count for pagination
    const totalCount = await prisma.activityLog.count({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      data: logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Get logs error:", error)
    return NextResponse.json({ error: "Failed to get logs" }, { status: 500 })
  }
}
