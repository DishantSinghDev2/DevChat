"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { MessageSquare, Users, Globe, ClipboardList, Settings, Bot, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <Icons.logo className="h-5 w-5" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/chats",
      label: "Chats",
      icon: <MessageSquare className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/chats"),
    },
    {
      href: "/dashboard/groups",
      label: "Groups",
      icon: <Users className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/groups"),
    },
    {
      href: "/dashboard/communities",
      label: "Communities",
      icon: <Globe className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/communities"),
    },
    {
      href: "/dashboard/ai",
      label: "AI Assistant",
      icon: <Bot className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/ai"),
    },
    {
      href: "/dashboard/logs",
      label: "Logs",
      icon: <ClipboardList className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/logs"),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Icons.logo className="h-6 w-6" />
          <span className="font-bold">DevChat</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback>
              {session?.user?.name
                ? session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium leading-none truncate">{session?.user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
