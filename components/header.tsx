import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { AuthButton } from "@/components/auth-button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-base sm:text-lg font-bold text-primary-foreground">B</span>
          </div>
          <span className="text-base sm:text-xl font-bold">BoostUp Ghana</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full"
          >
            <Link
              href="https://wa.me/233551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <MessageCircle className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Chat with Us</span>
              <span className="sm:hidden">Chat</span>
            </Link>
          </Button>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
