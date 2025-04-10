"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Code, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSession } from "next-auth/react"

const formSchema = z.object({
  status: z.enum(["available", "coding", "meeting", "afk", "dnd"]),
  statusMessage: z.string().max(100).optional(),
  githubUsername: z.string().optional(),
  blogUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
})

export function DeveloperStatusForm() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "available",
      statusMessage: "",
      githubUsername: "",
      blogUrl: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // In a real app, you would update the user's status in the database
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          status: values.status,
          statusMessage: values.statusMessage,
          githubUsername: values.githubUsername,
        },
      })

      toast({
        title: "Developer status updated",
        description: "Your status has been updated successfully.",
      })
    } catch (error) {
      console.error("Status update error:", error)
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Developer Status
        </CardTitle>
        <CardDescription>Set your availability status and developer profile</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Availability Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="available" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                            Available
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="coding" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                            Coding
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="meeting" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                            In a Meeting
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="afk" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                            AFK
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dnd" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                            Do Not Disturb
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statusMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What are you working on?" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Let others know what you're currently working on.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="githubUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Username</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="username" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Connect your GitHub profile to display your repositories and activity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="blogUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blog or Portfolio URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourblog.com" {...field} />
                  </FormControl>
                  <FormDescription>Share your blog or portfolio with other developers.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
