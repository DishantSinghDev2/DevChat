import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Secure Messaging for Developers
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                DevChat is a secure, transparent messaging platform built specifically for developers. With end-to-end
                encryption, code snippet sharing, and AI assistance, DevChat is the ultimate communication tool for tech
                teams.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[450px] w-full overflow-hidden rounded-xl border bg-background p-2 shadow-xl">
              <div className="flex h-full flex-col overflow-hidden rounded-lg bg-muted">
                <div className="flex h-12 items-center border-b px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="ml-4 text-sm font-medium">DevChat</div>
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-auto p-4">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10" />
                      <div className="rounded-lg bg-muted-foreground/10 p-3">
                        <p className="text-sm">
                          Hey, I'm working on the new API. Can you help me with the authentication?
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10" />
                      <div className="rounded-lg bg-muted-foreground/10 p-3">
                        <p className="text-sm">I'm thinking of using JWT with refresh tokens. What do you think?</p>
                      </div>
                    </div>
                    <div className="mb-4 flex items-start justify-end gap-3">
                      <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                        <p className="text-sm">That's a good approach. Here's a code snippet to get you started:</p>
                        <pre className="mt-2 rounded bg-black/10 p-2 text-xs">
                          <code>
                            {`const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);`}
                          </code>
                        </pre>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-primary/10" />
                    </div>
                  </div>
                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border bg-background px-4 py-2 text-sm">Type a message...</div>
                      <Button size="icon" variant="ghost">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
