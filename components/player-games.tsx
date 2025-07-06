"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Game } from "@/lib/types"
import { Trophy, Users, Clock, Play, CheckCircle, XCircle } from "lucide-react"

interface PlayerGamesProps {
  onGameStart: (gameId: string) => void
}

export function PlayerGames({ onGameStart }: PlayerGamesProps) {
  const { user } = useAuth()
  const [myGames, setMyGames] = useState<Game[]>([])

  useEffect(() => {
    if (!user) return

    const gamesRef = ref(database, "games")
    const unsubscribe = onValue(gamesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const gamesList = Object.values(data) as Game[]
        // Filter games where current user is a player
        const userGames = gamesList.filter((game) => game.players && game.players[user.uid])
        setMyGames(userGames.sort((a, b) => b.createdAt - a.createdAt))
      } else {
        setMyGames([])
      }
    })
    return unsubscribe
  }, [user])

  const getGameStatus = (game: Game) => {
    switch (game.status) {
      case "scheduled":
        return { text: "Товлогдсон", color: "bg-blue-500", icon: Clock }
      case "waiting":
        return { text: "Хүлээгдэж байна", color: "bg-yellow-500", icon: Users }
      case "active":
        return { text: "Идэвхтэй", color: "bg-green-500", icon: Play }
      case "voting":
        return { text: "Санал хураалт", color: "bg-purple-500", icon: Trophy }
      case "ended":
        return { text: "Дууссан", color: "bg-gray-500", icon: game.winnerId ? CheckCircle : XCircle }
      default:
        return { text: "Тодорхойгүй", color: "bg-gray-400", icon: Clock }
    }
  }

  const canJoinGame = (game: Game) => {
    return game.status === "waiting" || game.status === "active" || game.status === "voting"
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-300 mb-2">Миний тоглоомууд</h2>
        <p className="text-amber-200 text-sm">Таны оролцсон тоглоомуудын жагсаалт</p>
      </div>

      {myGames.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="p-8 text-center">
            <div className="character-container w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="coin-icon w-12 h-12 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-900" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-300 mb-2">Тоглоом байхгүй</h3>
            <p className="text-amber-200 text-sm">Та одоогоор ямар ч тоглоомд оролцоогүй байна</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myGames.map((game) => {
            const status = getGameStatus(game)
            const StatusIcon = status.icon
            const playerCount = game.players ? Object.keys(game.players).length : 0
            const currentPlayer = game.players ? game.players[user?.uid || ""] : null

            return (
              <Card key={game.id} className="premium-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="coin-icon w-10 h-10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-amber-900" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-amber-300">GAME #{game.id.slice(-4)}</CardTitle>
                        <CardDescription className="text-xs text-amber-400">
                          {game.ticketPrice}₮ • {game.prizePool}₮ шагнал
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${status.color} text-white text-xs flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.text}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Game Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="stats-card p-3 text-center rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{playerCount}</div>
                      <div className="text-xs text-blue-300">Тоглогч</div>
                    </div>
                    <div className="stats-card p-3 text-center rounded-lg">
                      <div className="text-lg font-bold text-green-400">{currentPlayer?.score || 0}</div>
                      <div className="text-xs text-green-300">Миний оноо</div>
                    </div>
                    <div className="stats-card p-3 text-center rounded-lg">
                      <div className="text-lg font-bold text-purple-400">{game.currentRound || 0}</div>
                      <div className="text-xs text-purple-300">Шат</div>
                    </div>
                  </div>

                  {/* Player Status */}
                  {currentPlayer && (
                    <div className="gaming-card p-3 rounded-lg border border-amber-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 text-sm">Миний байдал:</span>
                        <Badge variant={currentPlayer.isEliminated ? "destructive" : "default"} className="text-xs">
                          {currentPlayer.isEliminated ? "Хасагдсан" : "Идэвхтэй"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Game Time */}
                  <div className="text-xs text-amber-400 text-center">
                    Үүсгэсэн: {new Date(game.createdAt).toLocaleString("mn-MN")}
                  </div>

                  {/* Action Button */}
                  {canJoinGame(game) && !currentPlayer?.isEliminated && (
                    <Button
                      onClick={() => onGameStart(game.id)}
                      className="w-full h-12 font-bold premium-button text-black"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Тоглоомд орох
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
