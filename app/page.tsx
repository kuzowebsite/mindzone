"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthForm } from "@/components/auth-form"
import { Lobby } from "@/components/lobby"
import { GameRoom } from "@/components/game-room"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function Home() {
  const { user, userProfile, loading, error } = useAuth()
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-red-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-red-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Connection Error</div>
          <div className="text-white text-lg mb-4">Unable to connect to the server</div>
          <div className="text-gray-300 text-sm">Please check your internet connection and try again</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return <AuthForm />
  }

  // Role-based routing
  if (userProfile.role === "organizer") {
    return <AdminDashboard />
  }

  // Player routing
  if (currentGameId) {
    return <GameRoom gameId={currentGameId} onLeaveGame={() => setCurrentGameId(null)} />
  }

  return <Lobby onGameStart={setCurrentGameId} />
}
