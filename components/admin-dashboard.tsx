"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useGame } from "@/hooks/use-game"
import { ref, onValue, update } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Game, WithdrawalRequest, DepositRequest } from "@/lib/types"
import {
  Settings,
  Plus,
  ShoppingCart,
  Play,
  Users,
  Trophy,
  Crown,
  Gamepad2,
  BarChart3,
  Calendar,
  DollarSign,
  Building,
  User,
  CheckCircle,
  Bell,
  Wallet,
  Copy,
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
  Vote,
  UserCheck,
} from "lucide-react"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const { createGame } = useGame(null)
  const [allGames, setAllGames] = useState<Game[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([])

  // Classic Game States
  const [ticketPrice, setTicketPrice] = useState(10000)
  const [joinDate, setJoinDate] = useState("")
  const [joinTime, setJoinTime] = useState("")
  const [ticketDeadlineDate, setTicketDeadlineDate] = useState("")
  const [ticketDeadlineTime, setTicketDeadlineTime] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")

  // Individual Game States
  const [individualTicketPrice, setIndividualTicketPrice] = useState(10000)
  const [individualJoinDate, setIndividualJoinDate] = useState("")
  const [individualJoinTime, setIndividualJoinTime] = useState("")
  const [individualTicketDeadlineDate, setIndividualTicketDeadlineDate] = useState("")
  const [individualTicketDeadlineTime, setIndividualTicketDeadlineTime] = useState("")
  const [individualStartDate, setIndividualStartDate] = useState("")
  const [individualStartTime, setIndividualStartTime] = useState("")

  const [loading, setLoading] = useState(false)
  const [individualLoading, setIndividualLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<"games" | "withdrawals" | "deposits">("games")
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})

  // Listen to all games
  useEffect(() => {
    const gamesRef = ref(database, "games")
    const unsubscribe = onValue(gamesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const gamesList = Object.values(data) as Game[]
        setAllGames(gamesList.sort((a, b) => b.createdAt - a.createdAt))
      } else {
        setAllGames([])
      }
    })
    return unsubscribe
  }, [])

  // Listen to withdrawal requests
  useEffect(() => {
    const withdrawalsRef = ref(database, "withdrawalRequests")
    const unsubscribe = onValue(withdrawalsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const requestsList = Object.entries(data).map(([id, request]: [string, any]) => ({
          id,
          ...request,
        })) as WithdrawalRequest[]
        setWithdrawalRequests(requestsList.sort((a, b) => b.requestedAt - a.requestedAt))
      } else {
        setWithdrawalRequests([])
      }
    })
    return unsubscribe
  }, [])

  // Listen to deposit requests
  useEffect(() => {
    const depositsRef = ref(database, "depositRequests")
    const unsubscribe = onValue(depositsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const requestsList = Object.entries(data).map(([id, request]: [string, any]) => ({
          id,
          ...request,
        })) as DepositRequest[]
        setDepositRequests(requestsList.sort((a, b) => b.requestedAt - a.requestedAt))
      } else {
        setDepositRequests([])
      }
    })
    return unsubscribe
  }, [])

  const handleCreateScheduledGame = async () => {
    if (!user || !joinDate || !joinTime || !ticketDeadlineDate || !ticketDeadlineTime || !startDate || !startTime) {
      alert("Бүх талбарыг бөглөнө үү")
      return
    }

    setLoading(true)
    try {
      const joinDateTime = new Date(`${joinDate}T${joinTime}`).getTime()
      const ticketDeadlineDateTime = new Date(`${ticketDeadlineDate}T${ticketDeadlineTime}`).getTime()
      const startDateTime = new Date(`${startDate}T${startTime}`).getTime()

      // Validate time sequence
      if (joinDateTime >= ticketDeadlineDateTime) {
        alert("Нэгдэх хугацаа тасалбар авах хугацаанаас өмнө байх ёстой")
        return
      }

      if (ticketDeadlineDateTime >= startDateTime) {
        alert("Тасалбар авах хугацаа тоглоом эхлэх хугацаанаас өмнө байх ёстой")
        return
      }

      if (joinDateTime <= Date.now()) {
        alert("Нэгдэх хугацаа одоогоос хойш байх ёстой")
        return
      }

      await createGame(user.uid, ticketPrice, startDateTime, joinDateTime, ticketDeadlineDateTime, "classic")
      alert("Санлын тоглоом амжилттай товлогдлоо!")

      // Reset form
      setTicketPrice(10000)
      setJoinDate("")
      setJoinTime("")
      setTicketDeadlineDate("")
      setTicketDeadlineTime("")
      setStartDate("")
      setStartTime("")
    } catch (error) {
      console.error("Тоглоом товлоход алдаа гарлаа:", error)
      alert("Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIndividualGame = async () => {
    if (
      !user ||
      !individualJoinDate ||
      !individualJoinTime ||
      !individualTicketDeadlineDate ||
      !individualTicketDeadlineTime ||
      !individualStartDate ||
      !individualStartTime
    ) {
      alert("Бүх талбарыг бөглөнө үү")
      return
    }

    setIndividualLoading(true)
    try {
      const joinDateTime = new Date(`${individualJoinDate}T${individualJoinTime}`).getTime()
      const ticketDeadlineDateTime = new Date(
        `${individualTicketDeadlineDate}T${individualTicketDeadlineTime}`,
      ).getTime()
      const startDateTime = new Date(`${individualStartDate}T${individualStartTime}`).getTime()

      // Validate time sequence
      if (joinDateTime >= ticketDeadlineDateTime) {
        alert("Нэгдэх хугацаа тасалбар авах хугацаанаас өмнө байх ёстой")
        return
      }

      if (ticketDeadlineDateTime >= startDateTime) {
        alert("Тасалбар авах хугацаа тоглоом эхлэх хугацаанаас өмнө байх ёстой")
        return
      }

      if (joinDateTime <= Date.now()) {
        alert("Нэгдэх хугацаа одоогоос хойш байх ёстой")
        return
      }

      await createGame(
        user.uid,
        individualTicketPrice,
        startDateTime,
        joinDateTime,
        ticketDeadlineDateTime,
        "individual",
      )
      alert("Хувь хүний тоглоом амжилттай товлогдлоо!")

      // Reset form
      setIndividualTicketPrice(10000)
      setIndividualJoinDate("")
      setIndividualJoinTime("")
      setIndividualTicketDeadlineDate("")
      setIndividualTicketDeadlineTime("")
      setIndividualStartDate("")
      setIndividualStartTime("")
    } catch (error) {
      console.error("Тоглоом товлоход алдаа гарлаа:", error)
      alert("Алдаа гарлаа")
    } finally {
      setIndividualLoading(false)
    }
  }

  const handleProcessWithdrawal = async (requestId: string, playerUid: string, amount: number) => {
    try {
      // Update withdrawal request status
      const withdrawalRef = ref(database, `withdrawalRequests/${requestId}`)
      await update(withdrawalRef, {
        status: "completed",
        processedAt: Date.now(),
        processedBy: user?.uid,
      })

      // Deduct amount from player's total winnings
      const playerRef = ref(database, `users/${playerUid}`)
      const playerSnapshot = await new Promise<any>((resolve) => {
        onValue(playerRef, resolve, { onlyOnce: true })
      })

      const playerData = playerSnapshot.val()
      if (playerData) {
        const newTotalWinnings = Math.max(0, (playerData.totalWinnings || 0) - amount)
        await update(playerRef, {
          totalWinnings: newTotalWinnings,
        })
      }

      alert("Гүйлгээ амжилттай хийгдлээ!")
    } catch (error) {
      console.error("Гүйлгээ хийхэд алдаа гарлаа:", error)
      alert("Алдаа гарлаа")
    }
  }

  const handleProcessDeposit = async (requestId: string, playerUid: string, amount: number) => {
    try {
      // Update deposit request status
      const depositRef = ref(database, `depositRequests/${requestId}`)
      await update(depositRef, {
        status: "completed",
        processedAt: Date.now(),
        processedBy: user?.uid,
      })

      // Add amount to player's total winnings
      const playerRef = ref(database, `users/${playerUid}`)
      const playerSnapshot = await new Promise<any>((resolve) => {
        onValue(playerRef, resolve, { onlyOnce: true })
      })

      const playerData = playerSnapshot.val()
      if (playerData) {
        const newTotalWinnings = (playerData.totalWinnings || 0) + amount
        await update(playerRef, {
          totalWinnings: newTotalWinnings,
        })
      }

      alert("Цэнэглэх амжилттай хийгдлээ!")
    } catch (error) {
      console.error("Цэнэглэх хийхэд алдаа гарлаа:", error)
      alert("Алдаа гарлаа")
    }
  }

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems((prev) => ({ ...prev, [itemId]: true }))
      setTimeout(() => {
        setCopiedItems((prev) => ({ ...prev, [itemId]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Get current date and time for min values
  const now = new Date()
  const currentDate = now.toISOString().split("T")[0]

  // Calculate statistics
  const totalGames = allGames.length
  const activeGames = allGames.filter((g) => g.status === "active" || g.status === "waiting").length
  const totalPrizePool = allGames.reduce((sum, game) => sum + game.prizePool, 0)
  const totalPlayers = allGames.reduce((sum, game) => sum + (game.players ? Object.keys(game.players).length : 0), 0)
  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === "pending").length
  const pendingDeposits = depositRequests.filter((r) => r.status === "pending").length
  const totalWithdrawalAmount = withdrawalRequests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0)
  const totalDepositAmount = depositRequests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amount, 0)

  const getGameStatus = (game: Game) => {
    switch (game.status) {
      case "scheduled":
        return { text: "Товлогдсон", color: "bg-blue-500" }
      case "waiting":
        return { text: "Хүлээгдэж байна", color: "bg-yellow-500" }
      case "active":
        return { text: "Идэвхтэй", color: "bg-green-500" }
      case "voting":
        return { text: "Санал хураалт", color: "bg-purple-500" }
      case "ended":
        return { text: "Дууссан", color: "bg-gray-500" }
      default:
        return { text: "Тодорхойгүй", color: "bg-gray-400" }
    }
  }

  const getGameType = (game: Game) => {
    switch (game.gameType) {
      case "individual":
        return { text: "Хувь хүн", color: "bg-orange-500", icon: UserCheck }
      case "classic":
      default:
        return { text: "Санлын", color: "bg-purple-500", icon: Vote }
    }
  }

  return (
    <div className="mobile-optimized dark-premium relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-40 h-40 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 golden-gradient rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="character-container w-20 h-20 mx-auto mb-4 flex items-center justify-center float-animation">
            <div className="coin-icon w-16 h-16 flex items-center justify-center">
              <Settings className="h-8 w-8 text-amber-900" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text golden-gradient glow-text mb-2">
            АДМИН ХУУДАС
          </h1>
          <p className="text-amber-200 text-sm">Тоглоомын зохион байгуулалт</p>
        </div>

        {/* User Profile Card */}
        <Card className="premium-card glow-pulse mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="coin-icon w-12 h-12 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-amber-900" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-300">{user?.displayName}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Settings className="h-3 w-3" />
                    <span>Зохион байгуулагч</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gaming-card border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent"
              >
                Гарах
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveSection("games")}
            variant={activeSection === "games" ? "default" : "outline"}
            className={`flex-1 h-12 ${
              activeSection === "games"
                ? "premium-button text-black"
                : "gaming-card border-amber-500/30 text-amber-300 hover:bg-amber-500/20 bg-transparent"
            }`}
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            Тоглоомууд
          </Button>
          <Button
            onClick={() => setActiveSection("deposits")}
            variant={activeSection === "deposits" ? "default" : "outline"}
            className={`flex-1 h-12 relative ${
              activeSection === "deposits"
                ? "premium-button text-black"
                : "gaming-card border-green-500/30 text-green-300 hover:bg-green-500/20 bg-transparent"
            }`}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Цэнэглэх
            {pendingDeposits > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingDeposits}
              </Badge>
            )}
          </Button>
          <Button
            onClick={() => setActiveSection("withdrawals")}
            variant={activeSection === "withdrawals" ? "default" : "outline"}
            className={`flex-1 h-12 relative ${
              activeSection === "withdrawals"
                ? "premium-button text-black"
                : "gaming-card border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent"
            }`}
          >
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Татах
            {pendingWithdrawals > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingWithdrawals}
              </Badge>
            )}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="premium-card">
            <CardContent className="p-4 text-center">
              <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-amber-900" />
              </div>
              <div className="text-2xl font-bold text-amber-300">{totalGames}</div>
              <div className="text-xs text-amber-400">Нийт тоглоом</div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4 text-center">
              <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Play className="h-5 w-5 text-amber-900" />
              </div>
              <div className="text-2xl font-bold text-green-300">{activeGames}</div>
              <div className="text-xs text-amber-400">Идэвхтэй</div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4 text-center">
              <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-900" />
              </div>
              <div className="text-2xl font-bold text-blue-300">{totalPlayers}</div>
              <div className="text-xs text-amber-400">Нийт тоглогч</div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-4 text-center">
              <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-900" />
              </div>
              <div className="text-lg font-bold text-purple-300">{totalPrizePool.toLocaleString()}₮</div>
              <div className="text-xs text-amber-400">Нийт шагнал</div>
            </CardContent>
          </Card>
        </div>

        {/* Games Section */}
        {activeSection === "games" && (
          <div className="space-y-6">
            {/* Create Game Tabs */}
            <Card className="premium-card glow-pulse">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Шинэ тоглоом товлох
                </CardTitle>
                <CardDescription className="text-amber-400">Товлосон цагт эхлэх тоглоом үүсгэх</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="classic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="classic" className="flex items-center gap-2">
                      <Vote className="h-4 w-4" />
                      Санлын тоглоом
                    </TabsTrigger>
                    <TabsTrigger value="individual" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Хувь хүний тоглоом
                    </TabsTrigger>
                  </TabsList>

                  {/* Classic Game Tab */}
                  <TabsContent value="classic" className="space-y-4">
                    <div className="gaming-card p-4 rounded-lg border border-purple-500/30 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Vote className="h-5 w-5 text-purple-400" />
                        <h3 className="text-purple-300 font-semibold">Санлын тоглоомын дүрэм</h3>
                      </div>
                      <ul className="text-sm text-amber-200 space-y-1">
                        <li>
                          • Тоглогчид асуултад хариулж, буруу хариулсан эсвэл хамгийн сүүлд хариулсан тоглогч хасагдана
                        </li>
                        <li>• Шат дуусах бүрт үлдсэн тоглогчид санал өгнө: үргэлжлүүлэх эсвэл дуусгах</li>
                        <li>• Олонхын саналаар тоглоом үргэлжилнэ эсвэл дуусна</li>
                        <li>• Дуусгавал үлдсэн тоглогчид шагналыг хуваана</li>
                      </ul>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-amber-300 mb-2 block">Тасалбарын үнэ (₮)</label>
                      <Input
                        type="number"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(Number(e.target.value))}
                        min="1000"
                        step="1000"
                        className="gaming-card border-amber-500/30 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">Нэгдэх хугацаа</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={joinDate}
                            onChange={(e) => setJoinDate(e.target.value)}
                            min={currentDate}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                          <Input
                            type="time"
                            value={joinTime}
                            onChange={(e) => setJoinTime(e.target.value)}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">Тасалбар авах хугацаа</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={ticketDeadlineDate}
                            onChange={(e) => setTicketDeadlineDate(e.target.value)}
                            min={currentDate}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                          <Input
                            type="time"
                            value={ticketDeadlineTime}
                            onChange={(e) => setTicketDeadlineTime(e.target.value)}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-amber-300 mb-2 block">Тоглоом эхлэх хугацаа</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={currentDate}
                          className="gaming-card border-amber-500/30 text-white"
                        />
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="gaming-card border-amber-500/30 text-white"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateScheduledGame}
                      disabled={loading}
                      className="w-full h-12 font-bold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Үүсгэж байна...
                        </>
                      ) : (
                        <>
                          <Vote className="mr-2 h-4 w-4" />
                          Санлын тоглоом товлох
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* Individual Game Tab */}
                  <TabsContent value="individual" className="space-y-4">
                    <div className="gaming-card p-4 rounded-lg border border-orange-500/30 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-5 w-5 text-orange-400" />
                        <h3 className="text-orange-300 font-semibold">Хувь хүний тоглоомын дүрэм</h3>
                      </div>
                      <ul className="text-sm text-amber-200 space-y-1">
                        <li>
                          • Тоглогчид асуултад хариулж, буруу хариулсан эсвэл хамгийн сүүлд хариулсан тоглогч хасагдана
                        </li>
                        <li>• Шат дуусах бүрт тоглогч бүр өөрөө шийднэ: үргэлжлүүлэх эсвэл хувиа авч гарах</li>
                        <li>• Гарахаар шийдсэн тоглогч одоогийн хувиа авч тоглоомоос гарна</li>
                        <li>• Үлдсэн тоглогчид дараагийн шатанд үргэлжилнэ</li>
                        <li>• Санал хураалт байхгүй - хувь хүн бүр өөрөө шийднэ</li>
                      </ul>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-amber-300 mb-2 block">Тасалбарын үнэ (₮)</label>
                      <Input
                        type="number"
                        value={individualTicketPrice}
                        onChange={(e) => setIndividualTicketPrice(Number(e.target.value))}
                        min="1000"
                        step="1000"
                        className="gaming-card border-amber-500/30 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">Нэгдэх хугацаа</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={individualJoinDate}
                            onChange={(e) => setIndividualJoinDate(e.target.value)}
                            min={currentDate}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                          <Input
                            type="time"
                            value={individualJoinTime}
                            onChange={(e) => setIndividualJoinTime(e.target.value)}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">Тасалбар авах хугацаа</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={individualTicketDeadlineDate}
                            onChange={(e) => setIndividualTicketDeadlineDate(e.target.value)}
                            min={currentDate}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                          <Input
                            type="time"
                            value={individualTicketDeadlineTime}
                            onChange={(e) => setIndividualTicketDeadlineTime(e.target.value)}
                            className="gaming-card border-amber-500/30 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-amber-300 mb-2 block">Тоглоом эхлэх хугацаа</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={individualStartDate}
                          onChange={(e) => setIndividualStartDate(e.target.value)}
                          min={currentDate}
                          className="gaming-card border-amber-500/30 text-white"
                        />
                        <Input
                          type="time"
                          value={individualStartTime}
                          onChange={(e) => setIndividualStartTime(e.target.value)}
                          className="gaming-card border-amber-500/30 text-white"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateIndividualGame}
                      disabled={individualLoading}
                      className="w-full h-12 font-bold bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {individualLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Үүсгэж байна...
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Хувь хүний тоглоом товлох
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Games List */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Бүх тоглоомууд
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allGames.length === 0 ? (
                    <div className="text-center py-8 text-amber-400">
                      <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Тоглоом байхгүй байна</p>
                    </div>
                  ) : (
                    allGames.map((game) => {
                      const status = getGameStatus(game)
                      const gameType = getGameType(game)
                      const playerCount = game.players ? Object.keys(game.players).length : 0
                      const GameTypeIcon = gameType.icon

                      return (
                        <div key={game.id} className="gaming-card p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${status.color} text-white text-xs`}>{status.text}</Badge>
                              <Badge className={`${gameType.color} text-white text-xs flex items-center gap-1`}>
                                <GameTypeIcon className="h-3 w-3" />
                                {gameType.text}
                              </Badge>
                              <span className="text-amber-300 font-semibold text-sm">ID: {game.id.slice(-6)}</span>
                            </div>
                            <div className="text-amber-400 text-xs">
                              {new Date(game.createdAt).toLocaleDateString("mn-MN")}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-amber-400" />
                              <span className="text-amber-200">Тасалбар: {game.ticketPrice.toLocaleString()}₮</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-amber-400" />
                              <span className="text-amber-200">Тоглогч: {playerCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-400" />
                              <span className="text-amber-200">Шагнал: {game.prizePool.toLocaleString()}₮</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-amber-400" />
                              <span className="text-amber-200">
                                Эхлэх: {new Date(game.scheduledStartTime).toLocaleString("mn-MN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Deposits Section */}
        {activeSection === "deposits" && (
          <div className="space-y-6">
            {/* Deposit Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-900" />
                  </div>
                  <div className="text-2xl font-bold text-green-300">{pendingDeposits}</div>
                  <div className="text-xs text-amber-400">Хүлээгдэж буй</div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-900" />
                  </div>
                  <div className="text-lg font-bold text-green-300">{totalDepositAmount.toLocaleString()}₮</div>
                  <div className="text-xs text-amber-400">Нийт дүн</div>
                </CardContent>
              </Card>
            </div>

            {/* Deposit Requests */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-green-300 flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Цэнэглэх хүсэлтүүд
                </CardTitle>
                <CardDescription className="text-green-400">
                  Тоглогчдын цэнэглэх хүсэлтүүдийг шалгаж баталгаажуулах
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {depositRequests.length === 0 ? (
                    <div className="text-center py-8 text-amber-400">
                      <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Цэнэглэх хүсэлт байхгүй байна</p>
                    </div>
                  ) : (
                    depositRequests.map((request) => (
                      <div key={request.id} className="gaming-card p-4 rounded-lg border border-green-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-white text-xs ${
                                request.status === "pending"
                                  ? "bg-yellow-500"
                                  : request.status === "completed"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                              }`}
                            >
                              {request.status === "pending"
                                ? "Хүлээгдэж байна"
                                : request.status === "completed"
                                  ? "Цэнэглэгдсэн"
                                  : "Цэнэглэгдээгүй"}
                            </Badge>
                            <span className="text-green-300 font-bold text-lg">{request.amount.toLocaleString()}₮</span>
                          </div>
                          <div className="text-amber-400 text-xs">
                            {new Date(request.requestedAt).toLocaleString("mn-MN")}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          {/* Player Info */}
                          <div className="space-y-2">
                            <h4 className="text-green-300 font-semibold flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Тоглогчийн мэдээлэл
                            </h4>
                            <div className="space-y-1 text-amber-200">
                              <div className="flex justify-between">
                                <span>Нэр:</span>
                                <span className="font-medium">{request.playerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>ID:</span>
                                <span className="font-mono">{request.playerId}</span>
                              </div>
                            </div>
                          </div>

                          {/* Internal Account Info */}
                          <div className="space-y-2">
                            <h4 className="text-green-300 font-semibold flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              Сайтын данс
                            </h4>
                            <div className="space-y-1 text-amber-200">
                              <div className="flex justify-between items-center">
                                <span>Дугаар:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{request.internalAccount.accountNumber}</span>
                                  <button
                                    onClick={() =>
                                      handleCopy(request.internalAccount.accountNumber, `deposit-account-${request.id}`)
                                    }
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                  >
                                    {copiedItems[`deposit-account-${request.id}`] ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Нэр:</span>
                                <span className="font-medium">{request.internalAccount.displayName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bank Account Info */}
                          <div className="space-y-2 md:col-span-2">
                            <h4 className="text-green-300 font-semibold flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Мөнгө шилжүүлсэн банкны мэдээлэл
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-200">
                              <div className="flex justify-between">
                                <span>Банк:</span>
                                <span className="font-medium">{request.bankAccount.bankName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Данс:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{request.bankAccount.accountNumber}</span>
                                  <button
                                    onClick={() =>
                                      handleCopy(request.bankAccount.accountNumber, `deposit-bank-${request.id}`)
                                    }
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                  >
                                    {copiedItems[`deposit-bank-${request.id}`] ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Эзэмшигч:</span>
                                <span className="font-medium">{request.bankAccount.accountHolderName}</span>
                              </div>
                              {request.bankAccount.iban && (
                                <div className="flex justify-between items-center">
                                  <span>IBAN:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{request.bankAccount.iban}</span>
                                    <button
                                      onClick={() =>
                                        handleCopy(request.bankAccount.iban!, `deposit-iban-${request.id}`)
                                      }
                                      className="text-green-400 hover:text-green-300 transition-colors"
                                    >
                                      {copiedItems[`deposit-iban-${request.id}`] ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleProcessDeposit(request.id, request.playerUid, request.amount)}
                              className="flex-1 h-10 font-bold bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Цэнэглэсэн
                            </Button>
                          </div>
                        )}

                        {request.status === "completed" && request.processedAt && (
                          <div className="text-center text-green-300 text-sm">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Цэнэглэгдсэн: {new Date(request.processedAt).toLocaleString("mn-MN")}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawals Section */}
        {activeSection === "withdrawals" && (
          <div className="space-y-6">
            {/* Withdrawal Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-900" />
                  </div>
                  <div className="text-2xl font-bold text-red-300">{pendingWithdrawals}</div>
                  <div className="text-xs text-amber-400">Хүлээгдэж буй</div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <div className="coin-icon w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-900" />
                  </div>
                  <div className="text-lg font-bold text-red-300">{totalWithdrawalAmount.toLocaleString()}₮</div>
                  <div className="text-xs text-amber-400">Нийт дүн</div>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawal Requests */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-red-300 flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5" />
                  Татах хүсэлтүүд
                </CardTitle>
                <CardDescription className="text-red-400">
                  Тоглогчдын мөнгө татах хүсэлтүүдийг шалгаж шилжүүлэх
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawalRequests.length === 0 ? (
                    <div className="text-center py-8 text-amber-400">
                      <ArrowDownCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Татах хүсэлт байхгүй байна</p>
                    </div>
                  ) : (
                    withdrawalRequests.map((request) => (
                      <div key={request.id} className="gaming-card p-4 rounded-lg border border-red-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-white text-xs ${
                                request.status === "pending"
                                  ? "bg-yellow-500"
                                  : request.status === "completed"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                              }`}
                            >
                              {request.status === "pending"
                                ? "Хүлээгдэж байна"
                                : request.status === "completed"
                                  ? "Шилжүүлсэн"
                                  : "Цуцлагдсан"}
                            </Badge>
                            <span className="text-red-300 font-bold text-lg">{request.amount.toLocaleString()}₮</span>
                          </div>
                          <div className="text-amber-400 text-xs">
                            {new Date(request.requestedAt).toLocaleString("mn-MN")}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          {/* Player Info */}
                          <div className="space-y-2">
                            <h4 className="text-red-300 font-semibold flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Тоглогчийн мэдээлэл
                            </h4>
                            <div className="space-y-1 text-amber-200">
                              <div className="flex justify-between">
                                <span>Нэр:</span>
                                <span className="font-medium">{request.playerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>ID:</span>
                                <span className="font-mono">{request.playerId}</span>
                              </div>
                            </div>
                          </div>

                          {/* Internal Account Info */}
                          <div className="space-y-2">
                            <h4 className="text-red-300 font-semibold flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              Сайтын данс
                            </h4>
                            <div className="space-y-1 text-amber-200">
                              <div className="flex justify-between items-center">
                                <span>Дугаар:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{request.internalAccount.accountNumber}</span>
                                  <button
                                    onClick={() =>
                                      handleCopy(
                                        request.internalAccount.accountNumber,
                                        `withdraw-account-${request.id}`,
                                      )
                                    }
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    {copiedItems[`withdraw-account-${request.id}`] ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Нэр:</span>
                                <span className="font-medium">{request.internalAccount.displayName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bank Account Info */}
                          <div className="space-y-2 md:col-span-2">
                            <h4 className="text-red-300 font-semibold flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Мөнгө шилжүүлэх банкны мэдээлэл
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-200">
                              <div className="flex justify-between">
                                <span>Банк:</span>
                                <span className="font-medium">{request.bankAccount.bankName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Данс:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{request.bankAccount.accountNumber}</span>
                                  <button
                                    onClick={() =>
                                      handleCopy(request.bankAccount.accountNumber, `withdraw-bank-${request.id}`)
                                    }
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    {copiedItems[`withdraw-bank-${request.id}`] ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Эзэмшигч:</span>
                                <span className="font-medium">{request.bankAccount.accountHolderName}</span>
                              </div>
                              {request.bankAccount.iban && (
                                <div className="flex justify-between items-center">
                                  <span>IBAN:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{request.bankAccount.iban}</span>
                                    <button
                                      onClick={() =>
                                        handleCopy(request.bankAccount.iban!, `withdraw-iban-${request.id}`)
                                      }
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      {copiedItems[`withdraw-iban-${request.id}`] ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleProcessWithdrawal(request.id, request.playerUid, request.amount)}
                              className="flex-1 h-10 font-bold bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Шилжүүлсэн
                            </Button>
                          </div>
                        )}

                        {request.status === "completed" && request.processedAt && (
                          <div className="text-center text-green-300 text-sm">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Шилжүүлсэн: {new Date(request.processedAt).toLocaleString("mn-MN")}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
