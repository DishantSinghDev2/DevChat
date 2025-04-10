import type { Metadata } from "next"
import { GroupView } from "@/components/group/group-view"

export const metadata: Metadata = {
  title: "Group | DevChat",
  description: "Group conversation",
}

export default function GroupPage({ params }: { params: { groupId: string } }) {
  return <GroupView groupId={params.groupId} />
}
