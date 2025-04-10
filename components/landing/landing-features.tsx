import { ShieldCheck, Code, Bot, Users, FileCode, Github, Zap, Lock } from "lucide-react"

export function LandingFeatures() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              DevChat combines secure messaging with developer-specific features to create the ultimate communication
              platform for tech teams.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <ShieldCheck className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">End-to-End Encryption</h3>
            <p className="text-center text-muted-foreground">
              All messages are encrypted to ensure your conversations remain private and secure.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Code className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Code Snippet Sharing</h3>
            <p className="text-center text-muted-foreground">
              Share code with syntax highlighting for over 100 programming languages.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Bot className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">AI Assistance</h3>
            <p className="text-center text-muted-foreground">
              Integrated Gemini AI to help with coding questions and problem-solving.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Group Chats & Communities</h3>
            <p className="text-center text-muted-foreground">
              Create groups and communities for team collaboration and knowledge sharing.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <FileCode className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Markdown Support</h3>
            <p className="text-center text-muted-foreground">
              Write messages with rich formatting using Markdown, perfect for technical documentation and explanations.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Github className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">GitHub Integration</h3>
            <p className="text-center text-muted-foreground">
              Connect your GitHub profile to share repositories, issues, and pull requests directly in chats.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Real-time Collaboration</h3>
            <p className="text-center text-muted-foreground">
              See typing indicators, read receipts, and get instant notifications for a seamless collaboration
              experience.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Lock className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Full Transparency</h3>
            <p className="text-center text-muted-foreground">
              View detailed logs of all activity related to your account for complete peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
