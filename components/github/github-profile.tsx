"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Github, ExternalLink, Code, Star, GitFork, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Repository {
  id: number
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  updated_at: string
}

interface Contribution {
  date: string
  count: number
}

export function GitHubProfile() {
  const { data: session } = useSession()
  const [username, setUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [repos, setRepos] = useState<Repository[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.githubUsername) {
      setUsername(session.user.githubUsername)
      setIsConnected(true)
      fetchGitHubData(session.user.githubUsername)
    }
  }, [session])

  const fetchGitHubData = async (username: string) => {
    setIsLoading(true)
    try {
      // Fetch repositories
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`)
      if (!reposResponse.ok) throw new Error("Failed to fetch repositories")
      const reposData = await reposResponse.json()
      setRepos(reposData)

      // In a real app, you would fetch contributions data
      // For demo purposes, we'll generate mock data
      const mockContributions = generateMockContributions()
      setContributions(mockContributions)
    } catch (error) {
      console.error("GitHub data fetch error:", error)
      toast({
        variant: "destructive",
        title: "Error fetching GitHub data",
        description: "Please try again later or check your GitHub username.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockContributions = (): Contribution[] => {
    const contributions: Contribution[] = []
    const today = new Date()

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      contributions.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 10),
      })
    }

    return contributions
  }

  const handleConnect = () => {
    const newUsername = prompt("Enter your GitHub username:")
    if (newUsername) {
      setUsername(newUsername)
      setIsConnected(true)
      fetchGitHubData(newUsername)

      // In a real app, you would save this to the user's profile
      toast({
        title: "GitHub Connected",
        description: "Your GitHub profile has been connected successfully.",
      })
    }
  }

  const renderContributionGraph = () => {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4" />
          <h4 className="text-sm font-medium">Recent Contributions</h4>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {contributions.map((contribution, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                backgroundColor:
                  contribution.count === 0
                    ? "var(--muted)"
                    : `rgba(var(--primary), ${Math.min(0.2 + contribution.count * 0.1, 1)})`,
              }}
              title={`${contribution.date}: ${contribution.count} contributions`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Profile
          </CardTitle>
          <CardDescription>Connect your GitHub account to display your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConnect} className="w-full">
            <Github className="mr-2 h-4 w-4" />
            Connect GitHub
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Profile
        </CardTitle>
        <CardDescription>
          {username ? `Showing activity for ${username}` : "Connect your GitHub account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {repos.length > 0 ? (
              <>
                <h3 className="text-sm font-medium">Recent Repositories</h3>
                <div className="space-y-3">
                  {repos.map((repo) => (
                    <div key={repo.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{repo.name}</h4>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      {repo.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <Code className="h-3.5 w-3.5" />
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3.5 w-3.5" />
                          <span>{repo.forks_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderContributionGraph()}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No repositories found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
