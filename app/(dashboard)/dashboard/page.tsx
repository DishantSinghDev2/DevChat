import type { Metadata } from "next"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export const metadata: Metadata = {
  title: "Dashboard | DevChat",
  description: "Your DevChat dashboard",
}

export default function DashboardPage() {
  return <DashboardOverview />
}
