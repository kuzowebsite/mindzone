"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useGame } from "@/hooks/use-game"
import { Settings, Clock, Plus, ShoppingCart, Play } from "lucide-react"

interface AdminPanelProps {
  onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { user } = useAuth()
  const { createGame } = useGame(null)
  const [ticketPrice, setTicketPrice] = useState(10000)
  const [joinDate, setJoinDate] = useState("")
  const [joinTime, setJoinTime] = useState("")
  const [ticketDeadlineDate, setTicketDeadlineDate] = useState("")
  const [ticketDeadlineTime, setTicketDeadlineTime] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [loading, setLoading] = useState(false)

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

      await createGame(user.uid, ticketPrice, startDateTime, joinDateTime, ticketDeadlineDateTime)
      alert("Тоглоом амжилттай товлогдлоо!")

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

  // Get current date and time for min values
  const now = new Date()
  const currentDate = now.toISOString().split("T")[0]
  const currentTime = now.toTimeString().slice(0, 5)

  return (
    <div className="min-h-screen bg-[url('/cyber-grid.svg')] bg-cover bg-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600 mb-2 animate-pulse">
              Админ хяналт
            </h1>
            <p className="text-blue-300">Тоглоомын хуваарь товлох</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 neon-text">
              {user?.displayName}
            </Badge>
            <Button variant="outline" onClick={onClose} className="neon-button bg-transparent">
              Буцах
            </Button>
          </div>
        </div>

        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Plus className="h-5 w-5 neon-icon" />
              Шинэ тоглоом товлох
            </CardTitle>
            <CardDescription className="text-gray-400">Тоглоомын хуваарь болон нөхцлийг тохируулна уу</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">Тасалбарын үнэ (₮)</label>
                <Input
                  type="number"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  min="1000"
                  max="1000000"
                  step="1000"
                  className="neon-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">Хамгийн бага тоглогч</label>
                <Input type="number" value={8} disabled className="bg-gray-700 text-gray-400 neon-input" />
                <p className="text-xs text-gray-500 mt-1">Хамгийн багадаа 8 тоглогч шаардлагатай</p>
              </div>
            </div>

            <div className="border-t pt-6 border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-300">
                <Clock className="h-5 w-5 neon-icon" />
                Хугацааны тохиргоо
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="glass-card-small neon-border-green">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-400 text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 neon-icon" />
                      Нэгдэх хугацаа
                    </CardTitle>
                    <CardDescription className="text-gray-400">Тоглогчид хэзээнээс нэгдэж эхлэх вэ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-gray-300">Огноо</label>
                      <Input
                        type="date"
                        value={joinDate}
                        onChange={(e) => setJoinDate(e.target.value)}
                        min={currentDate}
                        className="neon-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-gray-300">Цаг</label>
                      <Input
                        type="time"
                        value={joinTime}
                        onChange={(e) => setJoinTime(e.target.value)}
                        className="neon-input"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-small neon-border-orange">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-orange-400 text-base flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 neon-icon" />
                      Тасалбар авах хугацаа
                    </CardTitle>
                    <CardDescription className="text-gray-400">Тасалбар авах хугацаа хэзээ дуусах вэ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-gray-300">Огноо</label>
                      <Input
                        type="date"
                        value={ticketDeadlineDate}
                        onChange={(e) => setTicketDeadlineDate(e.target.value)}
                        min={currentDate}
                        className="neon-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-gray-300">Цаг</label>
                      <Input
                        type="time"
                        value={ticketDeadlineTime}
                        onChange={(e) => setTicketDeadlineTime(e.target.value)}
                        className="neon-input"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-small neon-border-red">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-400 text-base flex items-center gap-2">
                      <Play className="h-4 w-4 neon-icon" />
                      Эхлэх хугацаа
                    </CardTitle>
                    <CardDescription className="text-gray-400">Тоглоом хэзээ эхлэх вэ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-gray-300">Огноо</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={currentDate}
                        className="neon-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-gray-300">Цаг</label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="neon-input"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 p-4 bg-gray-800 border border-blue-700 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">Хугацааны дараалал:</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="bg-green-900 text-green-300 px-2 py-1 rounded">1. Нэгдэх эхлэх</span>
                  <span>→</span>
                  <span className="bg-orange-900 text-orange-300 px-2 py-1 rounded">2. Тасалбар авах дуусах</span>
                  <span>→</span>
                  <span className="bg-red-900 text-red-300 px-2 py-1 rounded">3. Тоглоом эхлэх</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleCreateScheduledGame}
                className="neon-button bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={loading}
              >
                {loading ? "Товлож байна..." : "Тоглоом товлох"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 glass-card neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Settings className="h-5 w-5 neon-icon" />
              Тоглоомын дүрэм
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-300">Шинэ тохиргоо</h3>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Хамгийн багадаа 8 тоглогч шаардлагатай</li>
                  <li>• Дээд хязгаар байхгүй</li>
                  <li>• Тасалбар авах хугацаатай</li>
                  <li>• Автомат эхлэх системтэй</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-300">Хугацааны систем</h3>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Нэгдэх хугацаа: Тоглогчид бүртгүүлэх</li>
                  <li>• Тасалбар авах хугацаа: Төлбөр төлөх</li>
                  <li>• Эхлэх хугацаа: Тоглоом автомат эхлэх</li>
                  <li>• Цаг хугацаа бодогдоно</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
