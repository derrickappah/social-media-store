"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User, LogOut, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error("Error signing in:", error)
        
        // Check if it's the provider not enabled error
        if (error.message?.includes("provider is not enabled") || error.message?.includes("Unsupported provider")) {
          toast.error("Google Sign-In Not Configured", {
            description: "Please enable Google OAuth in your Supabase project settings. See console for details.",
            duration: 8000,
          })
          console.error(
            "\n❌ Google OAuth is not enabled in Supabase.\n\n" +
            "To fix this:\n" +
            "1. Go to your Supabase Dashboard\n" +
            "2. Navigate to Authentication → Providers\n" +
            "3. Enable the Google provider\n" +
            "4. Add your Google OAuth credentials (Client ID & Secret)\n" +
            "5. Set redirect URL: " + window.location.origin + "/auth/callback\n\n" +
            "For detailed setup instructions, check the README.md file."
          )
        } else {
          toast.error("Sign-In Failed", {
            description: error.message || "An error occurred during sign-in. Please try again.",
            duration: 5000,
          })
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("Sign-In Error", {
        description: "An unexpected error occurred. Please try again later.",
        duration: 5000,
      })
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <Button size="sm" variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (user) {
    const initials = user.email?.charAt(0).toUpperCase() || "U"
    const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/orders" className="flex items-center cursor-pointer">
              <Package className="mr-2 h-4 w-4" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button size="sm" onClick={signInWithGoogle} variant="outline">
      <User className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  )
}

