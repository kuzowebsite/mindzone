"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { useGame } from "@/hooks/use-game"
import type { Game, GameVotes } from "@/lib/types"
import { Vote, Trophy, Clock, XCircle, Users } from "lucide-react"

interface VoteScreenProps {
  gameId: string
  game: Game
  votes: GameVotes | null
}

export function VoteScreen({ gameId, game, votes }: VoteScreenProps) {
  const { user } = useAuth()
  const { submitVote, processVoteResults } = useGame(gameId)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<"continue" | "end" | null>(null)

  const activePlayers = Object.values(game.players).filter((p) => !p.isEliminated)
  const continueVotes = votes?.continue ? Object.keys(votes.continue).length : 0
  const endVotes = votes?.end ? Object.keys(votes.end).length : 0
  const totalVotes = continueVotes + endVotes
  const requiredVotes = activePlayers.length

  // Auto-process votes when all players have voted
  useEffect(() => {
    if (totalVotes === requiredVotes && totalVotes > 0) {
      setTimeout(() => {
        processVoteResults(gameId)
      }, 3000) // 3 second delay to show results
    }
  }, [totalVotes, requiredVotes, processVoteResults, gameId])

  const handleVote = async (choice: "continue" | "end") => {
    if (!user || hasVoted) return

    await submitVote(gameId, user.uid, choice)
    setHasVoted(true)
    setUserVote(choice)
  }

  const continuePercentage = requiredVotes > 0 ? (continueVotes / requiredVotes) * 100 : 0
  const endPercentage = requiredVotes > 0 ? (endVotes / requiredVotes) * 100 : 0

  // Find the player who was eliminated in the previous round
  const getEliminatedPlayer = () => {
    const allPlayers = Object.values(game.players)
    const eliminatedPlayers = allPlayers.filter((p) => p.isEliminated)

    if (eliminatedPlayers.length === 0) return null

    // Get the most recently eliminated player (assuming they were just eliminated)
    return eliminatedPlayers[eliminatedPlayers.length - 1]
  }

  const eliminatedPlayer = getEliminatedPlayer()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Санал хураалтын цаг</h1>
          <p className="text-red-300">Тоглоомын хувь заяаг шийдээрэй</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Хасагдсан тоглогч
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {eliminatedPlayer ? (
                  <>
                    <div className="mb-4">
                      <Badge variant="destructive" className="text-lg px-4 py-2">
                        {eliminatedPlayer.displayName}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Шинэ дүрмийн дагуу хасагдлаа</p>
                      <p className="text-xs text-gray-500">Тоглоом үргэлжилж байна</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">Хасагдсан тоглогч байхгүй</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trophy className="h-5 w-5" />
                Шагналын сан
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{game.prizePool}₮</div>
                <p className="text-sm text-gray-600 mb-2 flex items-center justify-center gap-1">
                  <Users className="h-4 w-4" />
                  {activePlayers.length} тоглогч үлдсэн
                </p>
                <p className="text-xs text-gray-500">
                  Хуваавал: {Math.floor(game.prizePool / activePlayers.length)}₮ тус бүр
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Vote className="h-5 w-5" />
              Саналаа өгнө үү
            </CardTitle>
            <CardDescription>Тоглоомыг үргэлжлүүлэх эсвэл дуусгаж шагналыг хуваах талаар сонгоно уу</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleVote("continue")}
                disabled={hasVoted}
                variant={userVote === "continue" ? "default" : "outline"}
                className="h-20 text-lg"
              >
                Үргэлжлүүлэх
                <br />
                <span className="text-sm opacity-75">Дараагийн шат руу</span>
              </Button>

              <Button
                onClick={() => handleVote("end")}
                disabled={hasVoted}
                variant={userVote === "end" ? "default" : "outline"}
                className="h-20 text-lg"
              >
                Дуусгаж хуваах
                <br />
                <span className="text-sm opacity-75">Мөнгө авах</span>
              </Button>
            </div>

            {hasVoted && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-center">
                Та {userVote === "continue" ? "үргэлжлүүлэх" : "дуусгах"} талаар санал өглөө. Бусад тоглогчдыг хүлээж
                байна...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-800 mb-6">
          <CardHeader>
            <CardTitle>
              Санал хураалтын явц ({totalVotes}/{requiredVotes})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Үргэлжлүүлэх ({continueVotes})</span>
                  <span className="text-sm text-gray-600">{continuePercentage.toFixed(0)}%</span>
                </div>
                <Progress value={continuePercentage} className="h-3" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Дуусгаж хуваах ({endVotes})</span>
                  <span className="text-sm text-gray-600">{endPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={endPercentage} className="h-3" />
              </div>
            </div>

            {totalVotes === requiredVotes && (
              <div className="mt-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded text-center">
                <div className="font-semibold mb-2">
                  {continueVotes > endVotes ? "🎮 Тоглоом үргэлжилнэ!" : "💰 Тоглоом дууслаа!"}
                </div>
                <p className="text-sm">
                  {continueVotes > endVotes
                    ? "Дараагийн шат удахгүй эхлэнэ..."
                    : "Шагналыг үлдсэн тоглогчид хуваалцлаа!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Flow Explanation */}
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              <div>
                <p className="font-semibold">Тоглоомын урсгал:</p>
                <div className="text-sm space-y-1">
                  <p>1️⃣ Хүлээлгийн өрөө → 2️⃣ Даалгавар → 3️⃣ Хасах → 4️⃣ Санал хураалт → 5️⃣ Дахин давтах</p>
                  <p>✅ Үргэлжлүүлэх: Дараагийн даалгавар руу шилжинэ</p>
                  <p>💰 Дуусгах: Шагналыг үлдсэн тоглогчид хуваалцана</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
