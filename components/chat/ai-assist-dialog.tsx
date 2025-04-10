"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormItem } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

const formSchema = z.object({
  prompt: z.string().min(1, "Please enter a prompt"),
})

interface AIAssistDialogProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage: (content: string) => void
}

export function AIAssistDialog({ isOpen, onClose, onSendMessage }: AIAssistDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const { toast } = useToast()
  const { data: session } = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: values.prompt,
          apiKey: session?.user?.geminiApiKey, // Use user's API key if available
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to generate AI response")
      }

      const data = await res.json()

      if (!data.data) {
        throw new Error("Invalid response from API")
      }

      setResponse(data.data)
    } catch (error) {
      console.error("AI error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate AI response. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendResponse = () => {
    if (response) {
      onSendMessage(response)
      onClose()
      form.reset()
      setResponse("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span>Gemini AI Assistant</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Ask Gemini AI anything..."
                    className="min-h-20"
                    {...form.register("prompt")}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Response
              </Button>
            </form>
          </Form>

          {response && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="font-medium">Gemini AI Response</span>
                </div>
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSendResponse}>Send to Chat</Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              Your prompts are processed using Gemini AI.
              {session?.user?.geminiApiKey
                ? "You're using your own API key."
                : "You're using the app's shared API key."}
            </p>
            <p className="mt-1">For privacy: No data is stored beyond what's needed to process your request.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
