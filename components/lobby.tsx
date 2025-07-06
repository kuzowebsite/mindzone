"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { useGame } from "@/hooks/use-game"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Player, Game } from "@/lib/types"
import { Trophy, ShoppingCart, User, Target, Star, Gamepad2, Timer, AlertTriangle, Crown, Zap } from "lucide-react"
import { BottomNavigation } from "./bottom-navigation"
import { PlayerGames } from "./player-games"
import { PlayerProfile } from "./player-profile"
import { PlayerRank } from "./player-rank"
import { Withdrawal } from "./withdrawal"

const getGameTypeDisplay = (gameType?: string) => {
  switch (gameType) {
    case "individual":
      return "Хувь сонгол"
    case "voting":
      return "Санал хураалт"
    case "team":
      return "Багийн тоглоом"
    case "classic":
    default:
      return "Санал хураалт"
  }
}

interface LobbyProps {
  onGameStart: (gameId: string) => void
}

export function Lobby({ onGameStart }: LobbyProps) {
  const { user, userProfile } = useAuth()
  const { joinGame } = useGame(null)
  const [scheduledGames, setScheduledGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [activeTab, setActiveTab] = useState<"home" | "games" | "rank" | "withdrawal" | "profile">("home")

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Listen to scheduled games
  useEffect(() => {
    const gamesRef = ref(database, "games")
    const unsubscribe = onValue(gamesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const gamesList = Object.values(data) as Game[]
        const activeGames = gamesList.filter((game) => game.status === "scheduled" || game.status === "waiting")
        setScheduledGames(activeGames)
      } else {
        setScheduledGames([])
      }
    })
    return unsubscribe
  }, [])

  const handleJoinGame = async (game: Game) => {
    if (!user || !userProfile) return

    setLoading(true)
    try {
      const player: Player = {
        uid: user.uid,
        playerId: userProfile.playerId,
        displayName: user.displayName || "Нэргүй",
        email: user.email || "",
        score: 0,
        isEliminated: false,
        joinedAt: Date.now(),
      }

      await joinGame(game.id, player)
      onGameStart(game.id)
    } catch (error) {
      console.error("Тоглоомд нэгдэхэд алдаа гарлаа:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (targetTime: number) => {
    const diff = targetTime - currentTime
    if (diff <= 0) return "Хугацаа дууссан"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}ц ${minutes}м`
    } else if (minutes > 0) {
      return `${minutes}м ${seconds}с`
    } else {
      return `${seconds}с`
    }
  }

  const canJoinGame = (game: Game) => {
    return (
      currentTime >= game.joinOpenTime &&
      currentTime < game.ticketPurchaseDeadline &&
      currentTime < game.scheduledStartTime
    )
  }

  const isTicketDeadlinePassed = (game: Game) => {
    return currentTime >= game.ticketPurchaseDeadline
  }

  const isGameStarted = (game: Game) => {
    return currentTime >= game.scheduledStartTime
  }

  const getPlayerCount = (game: Game) => {
    return game.players ? Object.keys(game.players).length : 0
  }

  const isPlayerJoined = (game: Game) => {
    return game.players && user?.uid ? Boolean(game.players[user.uid]) : false
  }

  const renderContent = () => {
    switch (activeTab) {
      case "games":
        return <PlayerGames onGameStart={onGameStart} />
      case "rank":
        return <PlayerRank />
      case "withdrawal":
        return <Withdrawal />
      case "profile":
        return <PlayerProfile />
      default:
        return renderHomeContent()
    }
  }

  const renderHomeContent = () => (
    <div className="space-y-4 pb-24">
      {/* User Profile Card */}
      <Card className="premium-card glow-pulse mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side - Site Logo only */}
            <div className="coin-icon w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Crown className="h-6 w-6 text-amber-900" />
            </div>

            {/* Center - Greeting with more left margin */}
            <div className="text-amber-300 text-sm font-medium ml-8 flex-1 text-center">Сайн байна уу!...</div>

            {/* Right side - Name and Profile with spacing */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-amber-300 font-bold text-sm">{user?.displayName}</div>
              <div className="coin-icon w-10 h-10 flex items-center justify-center overflow-hidden">
                {userProfile?.profileImage ? (
                  <img
                    src={userProfile.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5 text-amber-900" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games List */}
      {scheduledGames.length === 0 ? (
        <Card className="premium-card glow-pulse">
          <CardContent className="p-8 text-center">
            <div className="character-container w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <div className="coin-icon w-12 h-12 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-900" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-300 mb-2">Товлогдсон тоглоом байхгүй</h3>
            <p className="text-amber-200 text-sm">Зохион байгуулагч тоглоом товлохыг хүлээж байна</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduledGames.map((game) => {
            const playerCount = getPlayerCount(game)
            const joinOpen = canJoinGame(game)
            const ticketDeadlinePassed = isTicketDeadlinePassed(game)
            const gameStarted = isGameStarted(game)
            const playerJoined = isPlayerJoined(game)

            return (
              <Card key={game.id} className="premium-card glow-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
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
                    <div className="flex flex-col gap-1 items-end">
                      <Badge
                        variant={gameStarted ? "destructive" : joinOpen ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {gameStarted ? "Эхэлсэн" : joinOpen ? "Нээлттэй" : "Хүлээгдэж байна"}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-300">
                        {getGameTypeDisplay(game.gameType)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="stats-card p-3 text-center rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{playerCount}</div>
                      <div className="text-xs text-blue-300">Тоглогч</div>
                    </div>
                    <div className="stats-card p-3 text-center rounded-lg">
                      <div className="text-sm font-bold text-orange-400 flex items-center justify-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {formatTimeRemaining(game.ticketPurchaseDeadline)}
                      </div>
                      <div className="text-xs text-orange-300">Тасалбар</div>
                    </div>
                    <div className="stats-card p-3 text-center rounded-lg">
                      <div className="text-sm font-bold text-red-400 flex items-center justify-center gap-1">
                        <Zap className="h-3 w-3" />
                        {formatTimeRemaining(game.scheduledStartTime)}
                      </div>
                      <div className="text-xs text-red-300">Эхлэх</div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {!ticketDeadlinePassed && !gameStarted && (
                    <div className="gaming-card p-3 rounded-lg border border-orange-500/30">
                      <div className="flex items-center gap-2 text-orange-300 text-sm">
                        <Timer className="h-4 w-4" />
                        <span>Тасалбар авах: {formatTimeRemaining(game.ticketPurchaseDeadline)}</span>
                      </div>
                    </div>
                  )}

                  {ticketDeadlinePassed && !gameStarted && (
                    <div className="gaming-card p-3 rounded-lg border border-red-500/30">
                      <div className="flex items-center gap-2 text-red-300 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Тасалбар авах хугацаа дууссан</span>
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-amber-300">Бэлэн байдал</span>
                      {playerCount >= game.minPlayers ? (
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <Star className="h-3 w-3" />
                          <span>Бэлэн!</span>
                        </div>
                      ) : (
                        <span className="text-orange-400 text-sm">{game.minPlayers - playerCount} дутуу</span>
                      )}
                    </div>
                    <div className="relative">
                      <Progress
                        value={playerCount >= game.minPlayers ? 100 : (playerCount / game.minPlayers) * 100}
                        className="h-2 bg-gray-800"
                      />
                      {playerCount >= game.minPlayers && (
                        <div className="absolute inset-0 level-bar rounded-full opacity-70"></div>
                      )}
                    </div>
                  </div>

                  {/* Join Button */}
                  <Button
                    onClick={() => handleJoinGame(game)}
                    disabled={!joinOpen || gameStarted || loading || playerJoined || ticketDeadlinePassed}
                    className={`w-full h-12 font-bold ${
                      playerJoined ? "bg-green-600 hover:bg-green-700 text-white" : "premium-button text-black"
                    }`}
                  >
                    {playerJoined ? (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        Тасалбар авсан
                      </>
                    ) : gameStarted ? (
                      <>
                        <Gamepad2 className="mr-2 h-4 w-4" />
                        Эхэлсэн
                      </>
                    ) : ticketDeadlinePassed ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Хугацаа дууссан
                      </>
                    ) : !joinOpen ? (
                      <>
                        <Timer className="mr-2 h-4 w-4" />
                        Хүлээнэ үү
                      </>
                    ) : loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                        Боловсруулж байна...
                      </>
                    ) : (
                      <>
                        <Target className="mr-2 h-4 w-4" />
                        Тасалбар авах
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="mobile-optimized dark-premium relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 golden-gradient rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 max-w-md mx-auto">{renderContent()}</div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
