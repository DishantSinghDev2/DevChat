import type { Metadata } from "next"
import { CommunityView } from "@/components/community/community-view"

export const metadata: Metadata = {
  title: "Community | DevChat",
  description: "Community view",
}

export default function CommunityPage({ params }: { params: { communityId: string } }) {
  return <CommunityView communityId={params.communityId} />
}
