"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Search, Filter, Download, AlertTriangle, Info, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface Log {
  id: string
  action: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: "info" | "warning" | "error" | "success"
}

export function LogsView() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<Log[]>([])
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (session?.user?.id) {
      fetchLogs()
    }
  }, [session])

  // Replace mock data with API calls in the fetchLogs function
  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      // Get user's activity logs from API
      const response = await fetch("/api/logs")

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()

      if (!data.data) {
        throw new Error("Invalid response from API")
      }

      // Transform API response to match our component's expected format
      const logsData = data.data.map((log: any) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp,
        severity: determineSeverity(log.action),
      }))

      setLogs(logsData)
      setFilteredLogs(logsData)
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        variant: "destructive",
        title: "Failed to load logs",
        description: "Please try again later",
      })
      // Fallback to empty array if API fails
      setLogs([])
      setFilteredLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to determine log severity based on action
  const determineSeverity = (action: string): "info" | "warning" | "error" | "success" => {
    if (
      action.includes("Login") ||
      action.includes("Register") ||
      action.includes("Created") ||
      action.includes("Updated")
    ) {
      return "success"
    }

    if (action.includes("Failed") || action.includes("Error") || action.includes("Invalid")) {
      return "error"
    }

    if (action.includes("Deleted") || action.includes("Removed") || action.includes("Expired")) {
      return "warning"
    }

    return "info"
  }

  useEffect(() => {
    filterLogs()
  }, [searchQuery, severityFilter, activeTab, logs])

  const filterLogs = () => {
    let filtered = [...logs]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          log.ipAddress.toLowerCase().includes(query),
      )
    }

    // Filter by severity
    if (severityFilter !== "all") {
      filtered = filtered.filter((log) => log.severity === severityFilter)
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((log) => {
        if (activeTab === "auth") {
          return log.action.includes("Login") || log.action.includes("Register") || log.action.includes("Password")
        } else if (activeTab === "messages") {
          return log.action.includes("Message") || log.action.includes("Chat")
        } else if (activeTab === "files") {
          return log.action.includes("File") || log.action.includes("Upload") || log.action.includes("Download")
        } else if (activeTab === "security") {
          return (
            log.action.includes("Password") ||
            log.action.includes("API key") ||
            log.action.includes("Failed") ||
            log.severity === "error" ||
            log.severity === "warning"
          )
        }
        return true
      })
    }

    setFilteredLogs(filtered)
  }

  const handleExportLogs = () => {
    const exportData = filteredLogs.map((log) => ({
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
      severity: log.severity,
    }))

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `devchat-logs-${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      case "success":
        return <Check className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader/>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Complete transparency of all actions performed on your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="auth">Authentication</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  {renderLogsList()}
                </TabsContent>
                <TabsContent value="auth" className="mt-4">
                  {renderLogsList()}
                </TabsContent>
                <TabsContent value="messages" className="mt-4">
                  {renderLogsList()}
                </TabsContent>
                <TabsContent value="files" className="mt-4">
                  {renderLogsList()}
                </TabsContent>
                <TabsContent value="security" className="mt-4">
                  {renderLogsList()}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )

  function renderLogsList() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (filteredLogs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">No logs found</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getSeverityIcon(log.severity)}</div>
              <div className="flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-medium">{log.action}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {log.ipAddress}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{log.details}</p>
                <p className="mt-2 text-xs text-muted-foreground truncate">{log.userAgent}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
