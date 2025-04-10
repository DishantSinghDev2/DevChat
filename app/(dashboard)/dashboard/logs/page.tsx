import type { Metadata } from "next"
import { LogsView } from "@/components/logs/logs-view"

export const metadata: Metadata = {
  title: "Logs | DevChat",
  description: "Your activity logs",
}

export default function LogsPage() {
  return <LogsView />
}
