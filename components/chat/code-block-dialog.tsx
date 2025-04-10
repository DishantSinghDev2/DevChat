"use client"

import { useState } from "react"
import { Check, Copy, X } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTheme } from "next-themes"

interface CodeBlockDialogProps {
  isOpen: boolean
  onClose: () => void
  code: string
  language: string
  filename?: string
}

export function CodeBlockDialog({ isOpen, onClose, code, language, filename }: CodeBlockDialogProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{language}</span>
            {filename && <span className="text-sm font-normal text-muted-foreground">({filename})</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <div className="absolute right-2 top-2 flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleCopy} className="h-8 w-8">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[70vh] overflow-auto rounded-lg border p-4">
            <SyntaxHighlighter
              language={language}
              style={isDark ? vscDarkPlus : vs}
              customStyle={{ margin: 0, background: "transparent" }}
              showLineNumbers
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
