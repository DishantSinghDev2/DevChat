import type { Metadata } from "next"
import { CommunityList } from "@/components/community/community-list"
import { CommunityEmpty } from "@/components/community/community-empty"

export const metadata: Metadata = {
  title: "Communities | DevChat",
  description: "Your communities",
}

export default function CommunitiesPage() {
  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r pr-4">
        <CommunityList />
      </div>
      <div className="flex w-2/3 items-center justify-center">
        <CommunityEmpty />
      </div>
    </div>
  )
}
