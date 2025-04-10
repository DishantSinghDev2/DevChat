import type { Metadata } from "next"
import { GroupList } from "@/components/group/group-list"
import { GroupEmpty } from "@/components/group/group-empty"

export const metadata: Metadata = {
  title: "Groups | DevChat",
  description: "Your group conversations",
}

export default function GroupsPage() {
  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r pr-4">
        <GroupList />
      </div>
      <div className="flex w-2/3 items-center justify-center">
        <GroupEmpty />
      </div>
    </div>
  )
}
