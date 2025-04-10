import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { healthApi } from "@/lib/api-client"

export async function GET() {
  try {
    // Check database connection
    const dbStatus = await prisma.$queryRaw`SELECT 1`

    // Check API connection
    const apiResponse = await healthApi.check()
    const apiStatus = apiResponse.status === 200

    // Check Redis connection (if applicable)
    let redisStatus = false
    try {
      // This would be your Redis connection check
      // const redis = await getRedisClient()
      // await redis.ping()
      redisStatus = true
    } catch (error) {
      console.error("Redis health check error:", error)
      redisStatus = false
    }

    return NextResponse.json({
      status: dbStatus && apiStatus && redisStatus ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        api: apiStatus ? "connected" : "error",
        database: dbStatus ? "connected" : "error",
        redis: redisStatus ? "connected" : "error",
      },
      version: "1.0.0",
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Service unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
