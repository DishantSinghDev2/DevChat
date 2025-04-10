import type { Metadata } from "next"
import { ChatList } from "@/components/chat/chat-list"
import { ChatEmpty } from "@/components/chat/chat-empty"

export const metadata: Metadata = {
  title: "Chats | DevChat",
  description: "Your conversations",
}

export default function ChatsPage() {
  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r pr-4">
        <ChatList />
      </div>
      <div className="flex w-2/3 items-center justify-center">
        <ChatEmpty />
      </div>
    </div>
  )
}
