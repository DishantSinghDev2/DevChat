import type { Metadata } from "next"
import { ChatView } from "@/components/chat/chat-view"

export const metadata: Metadata = {
  title: "Chat | DevChat",
  description: "Chat conversation",
}

export default function ChatPage({ params }: { params: { chatId: string } }) {
  return <ChatView chatId={params.chatId} />
}
