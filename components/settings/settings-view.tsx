"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { ApiKeysForm } from "@/components/settings/api-keys-form"
import { DeveloperStatusForm } from "@/components/settings/developer-status-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { GitHubProfile } from "@/components/github/github-profile"

export function SettingsView() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    notificationsEnabled: true,
    soundEnabled: true,
    darkMode: false,
    encryptionEnabled: true,
    twoFactorEnabled: false,
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would update the user's profile via your API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: settings.name,
        },
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleChange = (field: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <DashboardHeader  />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="developer">Developer</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your public profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={settings.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    Your email address is used for login and cannot be changed
                  </p>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <GitHubProfile />
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Enable dark mode for the application</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleToggleChange("darkMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="encryption">End-to-End Encryption</Label>
                  <p className="text-xs text-muted-foreground">Enable end-to-end encryption for all messages</p>
                </div>
                <Switch
                  id="encryption"
                  checked={settings.encryptionEnabled}
                  onCheckedChange={(checked) => handleToggleChange("encryptionEnabled", checked)}
                />
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-2">Account Data</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  You can export your data or delete your account permanently
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline">Export Data</Button>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications for new messages and mentions</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => handleToggleChange("notificationsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sounds">Notification Sounds</Label>
                  <p className="text-xs text-muted-foreground">Play sounds for new messages and notifications</p>
                </div>
                <Switch
                  id="sounds"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => handleToggleChange("soundEnabled", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Notifications</Label>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="email-direct-messages" className="rounded" />
                    <Label htmlFor="email-direct-messages" className="text-sm font-normal">
                      Direct messages
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="email-group-messages" className="rounded" />
                    <Label htmlFor="email-group-messages" className="text-sm font-normal">
                      Group messages
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="email-security" className="rounded" />
                    <Label htmlFor="email-security" className="text-sm font-normal">
                      Security alerts
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => handleToggleChange("twoFactorEnabled", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button>Change Password</Button>

              <div className="rounded-lg border p-4 bg-muted/50 mt-4">
                <h4 className="text-sm font-medium mb-2">Active Sessions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  These are the devices that are currently logged into your account
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Browser</p>
                      <p className="text-xs text-muted-foreground">Last active: Just now</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Current
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Mobile App (iPhone)</p>
                      <p className="text-xs text-muted-foreground">Last active: 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="space-y-4">
          <DeveloperStatusForm />
          <ApiKeysForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
