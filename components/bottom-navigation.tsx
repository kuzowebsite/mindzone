"use client"
import { Button } from "@/components/ui/button"
import { Home, Gamepad2, User, Trophy, CreditCard } from "lucide-react"

interface BottomNavigationProps {
  activeTab: "home" | "games" | "rank" | "withdrawal" | "profile"
  onTabChange: (tab: "home" | "games" | "rank" | "withdrawal" | "profile") => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-gray-900 to-transparent p-2">
      <div className="max-w-md mx-auto">
        <div className="gaming-card rounded-xl p-1 border border-amber-500/30">
          <div className="grid grid-cols-5 gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("home")}
              className="flex items-center justify-center h-12 hover:bg-transparent"
            >
              <Home className={`h-5 w-5 ${activeTab === "home" ? "text-amber-400" : "text-amber-200/60"}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("games")}
              className="flex items-center justify-center h-12 hover:bg-transparent"
            >
              <Gamepad2 className={`h-5 w-5 ${activeTab === "games" ? "text-amber-400" : "text-amber-200/60"}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("rank")}
              className="flex items-center justify-center h-12 hover:bg-transparent"
            >
              <Trophy className={`h-5 w-5 ${activeTab === "rank" ? "text-amber-400" : "text-amber-200/60"}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("withdrawal")}
              className="flex items-center justify-center h-12 hover:bg-transparent"
            >
              <CreditCard
                className={`h-5 w-5 ${activeTab === "withdrawal" ? "text-amber-400" : "text-amber-200/60"}`}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange("profile")}
              className="flex items-center justify-center h-12 hover:bg-transparent"
            >
              <User className={`h-5 w-5 ${activeTab === "profile" ? "text-amber-400" : "text-amber-200/60"}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
