"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"
import { Crown, Medal, Award, Trophy, Users, TrendingUp, Star } from "lucide-react"

export function PlayerRank() {
  const [players, setPlayers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    if (!database) {
      setLoading(false)
      return
    }

    try {
      const usersRef = ref(database, "users")
      const snapshot = await get(usersRef)

      if (snapshot.exists()) {
        const usersData = snapshot.val()
        const playersList: UserProfile[] = Object.values(usersData)
          .filter((user: any) => user.role === "player" && user.gamesPlayed > 0) // Only players who have played games
          .sort((a: any, b: any) => (b.gameWinnings || 0) - (a.gameWinnings || 0)) // Sort by game winnings only

        setPlayers(playersList)
      }
    } catch (err) {
      console.error("Error fetching players:", err)
      setError("Тоглогчдын мэдээлэл татахад алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-300 font-bold text-sm">{rank}</span>
          </div>
        )
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-3 py-1">
            🥇 1-р байр
          </Badge>
        )
      case 2:
        return (
          <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-black font-bold px-3 py-1">
            🥈 2-р байр
          </Badge>
        )
      case 3:
        return (
          <Badge className="bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold px-3 py-1">
            🥉 3-р байр
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-300 font-bold px-3 py-1">
            #{rank}
          </Badge>
        )
    }
  }

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("mn-MN").format(amount)
  }

  const getWinRate = (player: UserProfile) => {
    if (player.gamesPlayed === 0) return 0
    // Simple win rate calculation based on games played and winnings
    const avgWinning = (player.gameWinnings || 0) / player.gamesPlayed
    return Math.min(Math.round((avgWinning / 1000) * 100), 100) // Rough calculation
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-24">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-300 mb-2">Тоглогчдын ранк</h2>
          <p className="text-amber-200 text-sm">Мэдээлэл ачааллаж байна...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 pb-24">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-300 mb-2">Тоглогчдын ранк</h2>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-300 mb-2">Тоглогчдын ранк</h2>
        <p className="text-amber-200 text-sm">Тоглоом тоглосон тоглогчдын жагсаалт</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-amber-400">
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            <span>Зөвхөн тоглоомын хожлогоор эрэмбэлэгдсэн</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="premium-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{players.length}</div>
            <div className="text-sm text-blue-300 flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Идэвхтэй тоглогч
            </div>
          </CardContent>
        </Card>
        <Card className="premium-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {players.length > 0 ? formatMoney(players[0]?.gameWinnings || 0) : "0"}₮
            </div>
            <div className="text-sm text-green-300 flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Дээд хожлого
            </div>
          </CardContent>
        </Card>
      </div>

      {players.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-amber-300 mb-2">Тоглогч байхгүй байна</h3>
            <p className="text-amber-400 text-sm">
              Одоогоор тоглоом тоглосон тоглогч байхгүй байна. Эхний тоглогч болоорой!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {players.map((player, index) => {
            const rank = index + 1
            const isTopThree = rank <= 3

            return (
              <Card
                key={player.uid}
                className={`premium-card transition-all duration-300 hover:scale-[1.02] ${
                  isTopThree ? "border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-transparent" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank Icon/Number */}
                    <div className="flex-shrink-0">{getRankIcon(rank)}</div>

                    {/* Player Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-amber-500/30">
                      <AvatarImage src={player.profileImage || "/placeholder.svg"} alt={player.displayName} />
                      <AvatarFallback className="bg-amber-500/20 text-amber-300 font-bold">
                        {getPlayerInitials(player.displayName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-amber-300 truncate">{player.displayName}</h3>
                        {getRankBadge(rank)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-amber-400">
                        <span>#{player.playerId}</span>
                        <span>•</span>
                        <span>{player.gamesPlayed} тоглоом</span>
                        <span>•</span>
                        <span>{getWinRate(player)}% амжилт</span>
                      </div>
                    </div>

                    {/* Winnings */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-green-400">{formatMoney(player.gameWinnings || 0)}₮</div>
                      <div className="text-xs text-green-300">тоглоомын хожлого</div>
                    </div>
                  </div>

                  {/* Additional info for top 10 */}
                  {rank <= 10 && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm font-bold text-purple-400">{player.highestScore}</div>
                          <div className="text-xs text-purple-300">Дээд оноо</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-blue-400">
                            {formatMoney(player.totalWinnings || 0)}₮
                          </div>
                          <div className="text-xs text-blue-300">Нийт үлдэгдэл</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                            <Star className="h-3 w-3" />
                            {Math.round((player.gameWinnings || 0) / Math.max(player.gamesPlayed, 1) / 100) || 0}
                          </div>
                          <div className="text-xs text-amber-300">Дундаж хожлого</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="premium-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-blue-300 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Тайлбар
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 text-xs text-blue-400">
            <p>• Зөвхөн тоглоом тоглосон тоглогчид харагдана</p>
            <p>• Зөвхөн тоглоомоос олсон мөнгөөр эрэмбэлэгдэнэ</p>
            <p>• Хэрэглэгч хоорондын шилжүүлэг тооцогдохгүй</p>
            <p>• Жинхэнэ тоглоомын амжилтыг харуулна</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
