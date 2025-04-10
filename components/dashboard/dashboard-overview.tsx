"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, Globe, Bot, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { analyticsApi } from "@/lib/api-client"

export function DashboardOverview() {
  const { data: session } = useSession()
  const [stats, setStats] = useState([
    {
      title: "Active Chats",
      value: "12",
      description: "Direct conversations",
      icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
      href: "/dashboard/chats",
    },
    {
      title: "Groups",
      value: "4",
      description: "Group conversations",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      href: "/dashboard/groups",
    },
    {
      title: "Communities",
      value: "2",
      description: "Community memberships",
      icon: <Globe className="h-5 w-5 text-muted-foreground" />,
      href: "/dashboard/communities",
    },
    {
      title: "AI Interactions",
      value: "28",
      description: "Gemini AI conversations",
      icon: <Bot className="h-5 w-5 text-muted-foreground" />,
      href: "/dashboard/ai",
    },
  ])
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: "message",
      description: "You received a message from Jane Smith",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "group",
      description: "New message in Frontend Developers group",
      time: "10 minutes ago",
    },
    {
      id: 3,
      type: "community",
      description: "New announcement in React Community",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "ai",
      description: "You asked Gemini AI about React hooks",
      time: "2 hours ago",
    },
  ])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      // Fetch user statistics
      const statsResponse = await analyticsApi.getUserStats(session?.user?.id || "")

      if (!statsResponse.data || !statsResponse.data.data) {
        throw new Error("Failed to fetch user statistics")
      }

      const statsData = statsResponse.data.data

      // Update stats with real data
      setStats([
        {
          title: "Active Chats",
          value: statsData.activeChatsCount.toString(),
          description: "Direct conversations",
          icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
          href: "/dashboard/chats",
        },
        {
          title: "Groups",
          value: statsData.groupsCount.toString(),
          description: "Group conversations",
          icon: <Users className="h-5 w-5 text-muted-foreground" />,
          href: "/dashboard/groups",
        },
        {
          title: "Communities",
          value: statsData.communitiesCount.toString(),
          description: "Community memberships",
          icon: <Globe className="h-5 w-5 text-muted-foreground" />,
          href: "/dashboard/communities",
        },
        {
          title: "AI Interactions",
          value: statsData.aiInteractionsCount.toString(),
          description: "Gemini AI conversations",
          icon: <Bot className="h-5 w-5 text-muted-foreground" />,
          href: "/dashboard/ai",
        },
      ])

      // Fetch recent activities
      const logsResponse = await fetch("/api/logs?limit=5")

      if (!logsResponse.ok) {
        throw new Error("Failed to fetch activity logs")
      }

      const logsData = await logsResponse.json()

      if (!logsData.data) {
        throw new Error("Invalid response from API")
      }

      // Transform logs to recent activities format
      const recentActivitiesData = logsData.data.map((log: any) => ({
        id: log.id,
        type: determineActivityType(log.action),
        description: log.details,
        time: formatTimeAgo(new Date(log.timestamp)),
      }))

      setRecentActivities(recentActivitiesData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Keep the default data if API fails
    }
  }

  // Helper function to determine activity type based on action
  const determineActivityType = (action: string): string => {
    if (action.includes("message") || action.includes("Message")) {
      return "message"
    }

    if (action.includes("group") || action.includes("Group")) {
      return "group"
    }

    if (action.includes("community") || action.includes("Community")) {
      return "community"
    }

    if (action.includes("AI") || action.includes("Gemini")) {
      return "ai"
    }

    return "other"
  }

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your recent activity and conversations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Button asChild variant="link" className="px-0 mt-2">
                <Link href={stat.href}>View all</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Developer Status</CardTitle>
            <CardDescription>Your current status and GitHub activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Available</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set your status to let others know when you're available for collaboration.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Update Status
                </Button>
              </div>

              <div className="rounded-lg border p-3">
                <h4 className="mb-2 text-sm font-medium">GitHub Activity</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account to display your recent activity and contributions.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Connect GitHub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
