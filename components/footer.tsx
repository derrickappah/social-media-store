import Link from "next/link"
import { Instagram, Mail, MessageCircle, Music } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border/40 bg-background">
      <div className="container px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-base sm:text-lg font-bold text-primary-foreground">B</span>
              </div>
              <span className="text-lg sm:text-xl font-bold">BoostUp Ghana</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Buy real engagement and followers to grow your social media fast.
            </p>
          </div>

          <div>
            <h3 className="mb-3 sm:mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 sm:mb-4 text-sm font-semibold">Payment Methods</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Mobile Money (Momo)</li>
              <li>Bank Transfer</li>
              <li>Card Payment</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 sm:mb-5 text-base sm:text-lg font-bold">Get In Touch</h3>
            <div className="space-y-3">
              <Link
                href="https://wa.me/233551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-medium truncate">+233 55 123 4567</p>
                </div>
              </Link>

              <Link
                href="mailto:support@boostupghana.com"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">support@boostupghana.com</p>
                </div>
              </Link>

              <Link
                href="https://instagram.com/boostupghana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Instagram className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Instagram</p>
                  <p className="text-sm font-medium truncate">@boostupghana</p>
                </div>
              </Link>

              <Link
                href="https://tiktok.com/@boostupghana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Music className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">TikTok</p>
                  <p className="text-sm font-medium truncate">@boostupghana</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 border-t border-border/40 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BoostUp Ghana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
