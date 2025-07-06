"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { useGame } from "@/hooks/use-game"
import { ref, push, onValue, get } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Challenge, UserProfile } from "@/lib/types"
import { Users, Trophy, Play, Timer, Star, Gamepad2, Target, MessageCircle, Send } from "lucide-react"
import { ChallengeScreen } from "./challenge-screen"
import { VoteScreen } from "./vote-screen"
import { GameOver } from "./game-over"

interface GameRoomProps {
  gameId: string
  onLeaveGame: () => void
}

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
}

export function GameRoom({ gameId, onLeaveGame }: GameRoomProps) {
  const { user } = useAuth()
  const { game, votes, startGame, createChallenge } = useGame(gameId)
  const [timeLeft, setTimeLeft] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, UserProfile>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)

  const activePlayers = game?.players ? Object.values(game.players).filter((p) => !p.isEliminated) : []
  const isHost = user?.uid === game?.hostId
  const canStart = activePlayers.length >= (game?.minPlayers || 8)

  // Fetch player profiles from database
  useEffect(() => {
    if (!game?.players) return

    const fetchPlayerProfiles = async () => {
      const profiles: Record<string, UserProfile> = {}

      for (const player of Object.values(game.players)) {
        try {
          const userRef = ref(database, `users/${player.uid}`)
          const snapshot = await get(userRef)
          if (snapshot.exists()) {
            profiles[player.uid] = snapshot.val()
          }
        } catch (error) {
          console.error(`Error fetching profile for ${player.uid}:`, error)
        }
      }

      setPlayerProfiles(profiles)
    }

    fetchPlayerProfiles()
  }, [game?.players])

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Listen to chat messages
  useEffect(() => {
    if (!gameId) return

    const chatRef = ref(database, `games/${gameId}/chat`)
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messages = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          ...msg,
        }))
        setChatMessages(messages.sort((a, b) => a.timestamp - b.timestamp))
      } else {
        setChatMessages([])
      }
    })

    return unsubscribe
  }, [gameId])

  useEffect(() => {
    if (game?.currentChallenge && game.currentChallenge.timeLimit > 0) {
      const endTime = game.currentChallenge.createdAt + game.currentChallenge.timeLimit * 1000
      const interval = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now())
        setTimeLeft(Math.ceil(remaining / 1000))

        if (remaining <= 0) {
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [game?.currentChallenge])

  // Auto-create next challenge when voting results in continue
  useEffect(() => {
    if (game?.status === "active" && !game.currentChallenge && game.currentRound > 0) {
      // This means voting finished and game continues, create next challenge
      const nextChallenge = getChallengeByRound(game.currentRound)
      createChallenge(gameId, nextChallenge)
    }
  }, [game?.status, game?.currentChallenge, game?.currentRound, createChallenge, gameId])

  const getChallengeByRound = (round: number): Omit<Challenge, "id" | "createdAt" | "timeLimit"> => {
    const challenges = [
      // Round 1 - Easy
      {
        type: "quiz" as const,
        difficulty: "easy" as const,
        title: "1-р шат: Ерөнхий мэдлэг",
        description: "Энгийн асуултад хариулж эхний шатыг давна уу.",
        question: "Монгол улсын нийслэл хот аль нь вэ?",
        options: ["Улаанбаатар", "Дархан", "Эрдэнэт", "Чойбалсан"],
        correctAnswer: "Улаанбаатар",
      },
      // Round 2 - Logic Easy
      {
        type: "logic" as const,
        difficulty: "easy" as const,
        title: "2-р шат: Логик сэтгэлгээ",
        description: "Логикийн энгийн бодлого шийдэж өмнөх амжилтаа үргэлжлүүлээрэй.",
        question: "Дараах дарааллын дараагийн тоо юу вэ? 2, 4, 8, 16, ?",
        options: ["24", "32", "20", "18"],
        correctAnswer: "32",
      },
      // Round 3 - Social Medium
      {
        type: "social" as const,
        difficulty: "medium" as const,
        title: "3-р шат: Нийгмийн мэдлэг",
        description: "Нийгэм, соёлын талаарх мэдлэгээ шалгаарай.",
        question: "Монголын уламжлалт баяр Цагаан сар хэдэн өдөр тэмдэглэгддэг вэ?",
        options: ["3 өдөр", "7 өдөр", "15 өдөр", "30 өдөр"],
        correctAnswer: "15 өдөр",
      },
      // Round 4 - Logic Medium
      {
        type: "logic" as const,
        difficulty: "medium" as const,
        title: "4-р шат: IQ тест",
        description: "Илүү төвөгтэй логикийн бодлого шийдэх цаг боллоо.",
        question: "Хэрэв A=1, B=2, C=3 бол HELLO гэдэг үгийн тоон утга хэд вэ?",
        options: ["52", "64", "48", "56"],
        correctAnswer: "52",
      },
      // Round 5 - Hard Quiz
      {
        type: "quiz" as const,
        difficulty: "hard" as const,
        title: "5-р шат: Хэцүү асуулт",
        description: "Өндөр түвшний мэдлэг шаардагдах асуулт.",
        question: "Дэлхийн хамгийн урт гол аль нь вэ?",
        options: ["Нил гол", "Амазон гол", "Янцзы гол", "Миссисипи гол"],
        correctAnswer: "Нил гол",
      },
      // Round 6 - Social Hard
      {
        type: "social" as const,
        difficulty: "hard" as const,
        title: "6-р шат: Улс төрийн мэдлэг",
        description: "Улс төр, түүхийн гүн гүнзгий мэдлэг шаардагдана.",
        question: "Монгол улсын анхны Ерөнхийлөгч хэн байсан бэ?",
        options: ["П.Очирбат", "Н.Багабанди", "Ц.Элбэгдорж", "Х.Баттулга"],
        correctAnswer: "П.Очирбат",
      },
    ]

    // Cycle through challenges if round exceeds available challenges
    const challengeIndex = (round - 1) % challenges.length
    return challenges[challengeIndex]
  }

  const handleStartGame = async () => {
    if (!game || !isHost) return
    await startGame(gameId)

    // Create first challenge
    const firstChallenge = getChallengeByRound(1)
    await createChallenge(gameId, firstChallenge)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !game) return

    const chatRef = ref(database, `games/${gameId}/chat`)
    const messageData = {
      playerId: user.uid,
      playerName: user.displayName || "Нэргүй",
      message: newMessage.trim(),
      timestamp: Date.now(),
    }

    try {
      await push(chatRef, messageData)
      setNewMessage("")
    } catch (error) {
      console.error("Мессеж илгээхэд алдаа гарлаа:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Get player profile data
  const getPlayerProfile = (playerId: string) => {
    return playerProfiles[playerId]
  }

  if (!game) {
    return (
      <div className="mobile-optimized dark-premium relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 golden-gradient rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 golden-gradient rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="character-container w-16 h-16 mx-auto mb-4 flex items-center justify-center float-animation">
              <div className="coin-icon w-12 h-12 flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-amber-900" />
              </div>
            </div>
            <div className="text-xl font-bold text-amber-300">Тоглоом ачааллаж байна...</div>
          </div>
        </div>
      </div>
    )
  }

  if (game.status === "ended") {
    return <GameOver game={game} onLeaveGame={onLeaveGame} />
  }

  if (game.status === "voting") {
    return <VoteScreen gameId={gameId} game={game} votes={votes} />
  }

  if (game.status === "active" && game.currentChallenge) {
    return <ChallengeScreen gameId={gameId} game={game} challenge={game.currentChallenge} timeLeft={timeLeft} />
  }

  return (
    <div className="mobile-optimized dark-premium relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 golden-gradient rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 max-w-md mx-auto">
        {/* Game Status Card */}
        <Card className="premium-card glow-pulse mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-amber-300 flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5" />
              Тоглоомын байдал
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="stats-card p-3 text-center rounded-lg">
                <div className="text-lg font-bold text-blue-400">{activePlayers.length}</div>
                <div className="text-xs text-blue-300">Тоглогч</div>
              </div>
              <div className="stats-card p-3 text-center rounded-lg">
                <div className="text-lg font-bold text-green-400">{game.prizePool.toLocaleString()}₮</div>
                <div className="text-xs text-green-300">Шагнал</div>
              </div>
              <div className="stats-card p-3 text-center rounded-lg">
                <div className="text-lg font-bold text-purple-400">{game.currentRound || 0}</div>
                <div className="text-xs text-purple-300">Шат</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="premium-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Тоглогчид ({activePlayers.length})
            </CardTitle>
            <CardDescription className="text-amber-400">
              Хамгийн багадаа {game.minPlayers} тоглогч шаардлагатай
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activePlayers.map((player) => {
                const profile = getPlayerProfile(player.uid)
                const displayName = profile?.displayName || player.displayName || "Нэргүй"
                const profileImage = profile?.profileImage

                return (
                  <div key={player.uid} className="gaming-card p-3 rounded-lg border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Profile Picture */}
                        <div className="coin-icon w-10 h-10 flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img
                              src={profileImage || "/placeholder.svg"}
                              alt={displayName}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full bg-amber-500 rounded-full flex items-center justify-center text-black font-bold text-sm">${displayName.charAt(0).toUpperCase()}</div>`
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-amber-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-amber-300">{displayName}</div>
                          <div className="text-xs text-amber-400">#{player.playerId}</div>
                        </div>

                        {player.uid === game.hostId && (
                          <Badge className="bg-blue-500 text-white text-xs border-none">Зохион байгуулагч</Badge>
                        )}
                      </div>

                      <div className="text-right">
                        <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                          {player.score} оноо
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Game Progress */}
        <Card className="premium-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Бэлэн байдал
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-amber-200 text-sm">Тоглогчдын тоо:</span>
                <span className="text-amber-300 font-semibold">
                  {activePlayers.length}/{game.minPlayers}
                </span>
              </div>

              <div className="relative">
                <Progress
                  value={canStart ? 100 : (activePlayers.length / game.minPlayers) * 100}
                  className="h-3 bg-gray-800"
                />
                {canStart && <div className="absolute inset-0 level-bar rounded-full opacity-70"></div>}
              </div>

              <div className="text-center">
                {canStart ? (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Star className="h-4 w-4" />
                    <span className="font-semibold">Тоглоом эхлэхэд бэлэн!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-orange-400">
                    <Timer className="h-4 w-4" />
                    <span>{game.minPlayers - activePlayers.length} тоглогч дутуу байна</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Room - Only show when waiting */}
        {game.status === "waiting" && (
          <Card className="premium-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Чат өрөө
              </CardTitle>
              <CardDescription className="text-amber-400">
                Тоглогчидтай чаталж, тоглоом эхлэхийг хүлээцгээе
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages */}
              <div className="gaming-card rounded-lg border border-amber-500/20 p-3 h-48 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-amber-400 mx-auto mb-2 opacity-50" />
                    <p className="text-amber-400 text-sm">Чат хоосон байна</p>
                    <p className="text-amber-500 text-xs">Эхний мессежийг илгээнэ үү!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded-lg ${
                          msg.playerId === user?.uid
                            ? "bg-amber-500/20 border border-amber-500/30 ml-4"
                            : "bg-gray-800/50 border border-gray-700/30 mr-4"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-amber-300">{msg.playerName}</span>
                          <span className="text-xs text-amber-500">
                            {new Date(msg.timestamp).toLocaleTimeString("mn-MN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-amber-200">{msg.message}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Мессеж бичнэ үү..."
                  className="gaming-card border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-400"
                  maxLength={200}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="premium-button text-black px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waiting Room Status */}
        {game.status === "waiting" && (
          <Card className="premium-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Хүлээлгийн өрөө
              </CardTitle>
              <CardDescription className="text-amber-400">
                {canStart
                  ? "Тоглоом удахгүй автоматаар эхлэнэ."
                  : `${game.minPlayers - activePlayers.length} тоглогч нэмэлт хүлээж байна.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canStart ? (
                <div className="text-center py-6">
                  <div className="character-container w-12 h-12 mx-auto mb-4 flex items-center justify-center float-animation">
                    <div className="coin-icon w-10 h-10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-amber-900" />
                    </div>
                  </div>
                  <p className="text-amber-200 text-sm mb-2">Илүү олон тоглогч хүлээж байна...</p>
                  <p className="text-amber-400 text-xs">Тоглоом хангалттай тоглогч цуглахад автоматаар эхлэнэ.</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="character-container w-12 h-12 mx-auto mb-4 flex items-center justify-center float-animation">
                    <div className="coin-icon w-10 h-10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-900" />
                    </div>
                  </div>
                  <p className="text-green-400 font-semibold mb-2">Бэлэн байна!</p>
                  <p className="text-amber-400 text-xs">Тоглоом удахгүй эхлэнэ...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isHost && game.status === "waiting" && canStart && (
            <Button onClick={handleStartGame} className="w-full h-12 font-bold premium-button text-black">
              <Play className="mr-2 h-4 w-4" />
              Тоглоом эхлүүлэх
            </Button>
          )}

          <Button
            onClick={onLeaveGame}
            variant="outline"
            className="w-full h-12 gaming-card border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent"
          >
            Тоглоомоос гарах
          </Button>
        </div>
      </div>
    </div>
  )
}
