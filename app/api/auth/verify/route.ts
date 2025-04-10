import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if verification code is valid and not expired
    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      !user.verificationExpires ||
      user.verificationExpires < new Date()
    ) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
      },
    })

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
