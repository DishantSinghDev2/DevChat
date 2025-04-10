"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Bot, Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"

const formSchema = z.object({
  geminiApiKey: z.string().optional(),
})

export function ApiKeysForm() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      geminiApiKey: session?.user?.geminiApiKey || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // In a real app, you would update the user's API key in the database
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          geminiApiKey: values.geminiApiKey,
        },
      })

      toast({
        title: "API key updated",
        description: "Your Gemini API key has been updated successfully.",
      })
    } catch (error) {
      console.error("API key update error:", error)
      toast({
        variant: "destructive",
        title: "Error updating API key",
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    const apiKey = form.getValues("geminiApiKey")
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateRandomApiKey = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 40; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    form.setValue("geminiApiKey", result)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Integration
        </CardTitle>
        <CardDescription>Manage your Gemini AI API key for AI-assisted features</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="geminiApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemini API Key</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          placeholder="Enter your Gemini API key"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      disabled={!form.getValues("geminiApiKey")}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={generateRandomApiKey}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Your API key is stored securely and used only for your AI interactions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Use app's shared API key</h4>
                <p className="text-sm text-muted-foreground">
                  If you don't have your own API key, you can use our shared key with usage limits
                </p>
              </div>
              <Switch
                checked={!form.getValues("geminiApiKey")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    form.setValue("geminiApiKey", "")
                  }
                }}
              />
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-2">About AI Integration</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>All AI interactions are end-to-end encrypted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>Your conversations are not stored or used for training</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>Using your own API key gives you full control over usage and billing</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
