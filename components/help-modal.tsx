"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BookOpen,
  Trophy,
  Users,
  ShoppingCart,
  Zap,
  Target,
  Crown,
  Star,
  Clock,
  Home,
  Gamepad2,
  CreditCard,
  User,
  Timer,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  onShowGuide: () => void
  onShowRules: () => void
}

export function HelpModal({ isOpen, onClose, onShowGuide, onShowRules }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gaming-card border-amber-500/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-300 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Тусламж
          </DialogTitle>
          <DialogDescription className="text-amber-400">Та юу мэдэхийг хүсэж байна?</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={onShowGuide}
            className="w-full h-16 premium-button text-black flex items-center gap-3 justify-start"
          >
            <div className="coin-icon w-10 h-10 flex items-center justify-center">
              <Target className="h-5 w-5 text-amber-900" />
            </div>
            <div className="text-left">
              <div className="font-bold">Сайтын заавар</div>
              <div className="text-sm opacity-80">Сайтыг хэрхэн ашиглах</div>
            </div>
          </Button>

          <Button
            onClick={onShowRules}
            className="w-full h-16 premium-button text-black flex items-center gap-3 justify-start"
          >
            <div className="coin-icon w-10 h-10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-amber-900" />
            </div>
            <div className="text-left">
              <div className="font-bold">Тоглоомын дүрэм</div>
              <div className="text-sm opacity-80">Squad Game дүрэм</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gaming-card border-amber-500/30 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-300 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Сайтын заавар
          </DialogTitle>
          <DialogDescription className="text-amber-400 text-base">
            Squad Game сайтыг хэрхэн ашиглах дэлгэрэнгүй заавар
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-amber-100">
          {/* Registration */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <Crown className="h-5 w-5" />
                1. Бүртгэл үүсгэх
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-amber-200 font-medium">• И-мэйл хаяг, нууц үг, хэрэглэгчийн нэрээ оруулна</p>
              <p className="text-amber-200 font-medium">• Тоглогч эсвэл зохион байгуулагч эрхийг сонгоно</p>
              <p className="text-amber-200 font-medium">• 18+ насны шаардлага болон EULA-г хүлээн зөвшөөрнө</p>
              <p className="text-amber-300 text-xs bg-amber-500/10 p-2 rounded">
                💡 Бүртгүүлсний дараа автоматаар тоглогчийн ID олгогдоно
              </p>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <Target className="h-5 w-5" />
                2. Доод цэсний ашиглалт
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex items-center gap-3 p-2 bg-amber-500/10 rounded">
                <Home className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-amber-200 font-medium">Нүүр хуудас</p>
                  <p className="text-amber-300 text-xs">Товлогдсон тоглоомуудын жагсаалт, тасалбар авах</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-amber-500/10 rounded">
                <Gamepad2 className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-amber-200 font-medium">Тоглолт</p>
                  <p className="text-amber-300 text-xs">Таны оролцсон тоглоомуудын түүх, статус</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-amber-500/10 rounded">
                <Trophy className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-amber-200 font-medium">Ранк</p>
                  <p className="text-amber-300 text-xs">Тоглогчдын рейтинг, таны байрлал</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-amber-500/10 rounded">
                <CreditCard className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-amber-200 font-medium">Мөнгө татах</p>
                  <p className="text-amber-300 text-xs">Хожсон мөнгөө дансандаа шилжүүлэх</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-amber-500/10 rounded">
                <User className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-amber-200 font-medium">Профайл</p>
                  <p className="text-amber-300 text-xs">Хувийн мэдээлэл, тохиргоо, заавар</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Participation */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                3. Тоглоомд оролцох
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-amber-200 font-medium">• Нүүр хуудаснаас товлогдсон тоглоом хайна</p>
              <p className="text-amber-200 font-medium">• Тасалбар авах хугацаанд "Тасалбар авах" товчийг дарна</p>
              <p className="text-amber-200 font-medium">• Хамгийн багадаа 8 тоглогч цуглах хүлээнэ</p>
              <p className="text-amber-200 font-medium">• Тоглоом автоматаар эхэлнэ</p>
              <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
                <p className="text-blue-300 text-xs font-medium flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Анхаар: Тасалбар авах хугацаа дуусмагц нэгдэх боломжгүй!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Game Process */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                4. Тоглоомын явц
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-amber-200 font-medium">• Хүлээлгийн өрөөнд бусад тоглогчидтай чатлана</p>
              <p className="text-amber-200 font-medium">• Даалгавар гүйцэтгэж, хариу илгээнэ</p>
              <p className="text-amber-200 font-medium">• Хасах үйл явц автоматаар явагдана</p>
              <p className="text-amber-200 font-medium">• Санал хураалтад оролцоно (үргэлжлүүлэх/дуусгах)</p>
              <p className="text-amber-200 font-medium">• Шагналын сангаас хуваалцана</p>
              <div className="bg-orange-500/10 p-3 rounded border border-orange-500/20">
                <p className="text-orange-300 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  Шинэ урсгал: Хүлээлгийн өрөө → Даалгавар → Хасах → Санал хураалт → Дахин давтах
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Money Withdrawal */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                5. Мөнгө татах
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-amber-200 font-medium">• "Мөнгө татах" хэсэгт дансны мэдээлэл оруулна</p>
              <p className="text-amber-200 font-medium">• Хожсон мөнгөнөөс татах дүнгээ сонгоно</p>
              <p className="text-amber-200 font-medium">• Гүйлгээ хийх товчийг дарна</p>
              <p className="text-amber-200 font-medium">• 2 минутын дотор дансанд орно</p>
              <div className="bg-green-500/10 p-3 rounded border border-green-500/20">
                <p className="text-green-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  Хаан банк болон бусад банкуудыг дэмждэг
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gaming-card border-amber-500/30 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-300 flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Тоглоомын дүрэм
          </DialogTitle>
          <DialogDescription className="text-amber-400 text-base">
            Squad Game: Амьд үлдэх санал хураалтын тэмцээн
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-amber-100">
          {/* Basic Rules */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Үндсэн дүрэм
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-amber-200 font-medium">• Хамгийн багадаа 8 тоглогч шаардлагатай</p>
              <p className="text-amber-200 font-medium">• Тасалбар худалдан авч оролцоно</p>
              <p className="text-amber-200 font-medium">• Олон шатлалт даалгавар гүйцэтгэнэ</p>
              <p className="text-amber-200 font-medium">• Санал хураалтаар тоглоомын хувь заяа шийдэгдэнэ</p>
              <p className="text-amber-200 font-medium">• Сүүлд үлдсэн тоглогч эсвэл хуваалцагчид шагнал авна</p>
            </CardContent>
          </Card>

          {/* Challenge Types */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Даалгаврын төрөл
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
                <p className="text-blue-300 font-medium mb-1">📚 Асуулт хариулт</p>
                <p className="text-blue-200 text-xs">Ерөнхий мэдлэг, логик, математикийн асуултууд</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded border border-purple-500/20">
                <p className="text-purple-300 font-medium mb-1">🧠 Сэтгэлгээний даалгавар</p>
                <p className="text-purple-200 text-xs">Оньсого тайлах, IQ, хувь хүний хөгжилийн асуулт</p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded border border-orange-500/20">
                <p className="text-orange-300 font-medium mb-1">🏛️ Нийгмийн мэдлэг</p>
                <p className="text-orange-200 text-xs">Улс төрийн асуулт, ёс заншил</p>
              </div>
            </CardContent>
          </Card>

          {/* New Game Flow */}
          <Card className="stats-card border border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-300 flex items-center gap-2">
                <Zap className="h-5 w-5" />🔄 Шинэ тоглоомын урсгал
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-200">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">1</span>
                <span className="font-medium">Хүлээлгийн өрөө - Чат, бэлтгэл</span>
              </div>
              <div className="flex items-center gap-2 text-amber-200">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">2</span>
                <span className="font-medium">Даалгавар - Хариу илгээх</span>
              </div>
              <div className="flex items-center gap-2 text-amber-200">
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">3</span>
                <span className="font-medium">Хасах - Автомат хасах үйл явц</span>
              </div>
              <div className="flex items-center gap-2 text-amber-200">
                <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">4</span>
                <span className="font-medium">Санал хураалт - Үргэлжлүүлэх/Дуусгах</span>
              </div>
              <div className="flex items-center gap-2 text-amber-200">
                <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs">5</span>
                <span className="font-medium">Дахин давтах эсвэл дуусгах</span>
              </div>
            </CardContent>
          </Card>

          {/* New Elimination Rule */}
          <Card className="stats-card border border-red-500/30 bg-red-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-300 flex items-center gap-2">
                <Timer className="h-5 w-5" />⚡ Шинэ хасах дүрэм
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="bg-red-500/20 p-3 rounded border border-red-500/40">
                <p className="text-red-200 font-bold text-center mb-2">🚨 АНХААРУУЛГА: Зөв бөгөөд хурдан байх!</p>
                <p className="text-red-100 font-medium">• Буруу хариулсан тоглогч эхэнд хасагдана</p>
                <p className="text-red-100 font-medium">
                  • Зөв хариулсан тоглогчдын дундаас хамгийн сүүлд илгээсэн хасагдана
                </p>
                <p className="text-red-100 font-medium">• Бүх тоглогч илгээсэн бол хугацаа дуусна</p>
                <p className="text-red-100 font-medium">• Хасахын дараа санал хураалт эхэлнэ</p>
              </div>
              <div className="space-y-2">
                <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                  <p className="text-yellow-300 font-medium text-xs">⏱️ Шинэ хугацааны систем:</p>
                  <p className="text-yellow-200 text-xs">• Амархан асуулт: 30с - 1мин</p>
                  <p className="text-yellow-200 text-xs">• Дунд зэрэг: 1 - 2мин</p>
                  <p className="text-yellow-200 text-xs">• Хэцүү асуулт: 2 - 3мин</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prize System */}
          <Card className="stats-card border border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Шагналын систем
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-amber-200 font-medium">• Тасалбарын үнэ = Шагналын санд орно</p>
              <p className="text-amber-200 font-medium">• Сүүлд үлдсэн 1 тоглогч бүгдийг авна</p>
              <p className="text-amber-200 font-medium">• Санал хураалтаар дуусгавал тэнцүү хуваалцана</p>
              <p className="text-amber-200 font-medium">• Зөв хариулсан тоглогчид хурдны урамшуулал</p>
              <div className="bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                <p className="text-yellow-300 text-xs font-medium">
                  💡 Жишээ: 10 тоглогч × 10,000₮ = 100,000₮ шагналын сан
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="stats-card border border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Чухал анхааруулга
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-orange-200 font-medium">⚠️ Тоглоом эхэлсний дараа гарах боломжгүй</p>
              <p className="text-orange-200 font-medium">⚠️ Тасалбарын мөнгө буцаагдахгүй</p>
              <p className="text-orange-200 font-medium">⚠️ Хуурамч хариу илгээвэл хасагдана</p>
              <p className="text-orange-200 font-medium">⚠️ Интернэт холболт тасарвал автоматаар хасагдана</p>
              <p className="text-orange-200 font-medium">⚡ Бүх тоглогч илгээсэн бол хугацаа дуусна</p>
              <div className="bg-red-500/20 p-3 rounded border border-red-500/40 mt-3">
                <p className="text-red-200 font-bold text-center">🔞 18+ насны шаардлага хатуу баримтлагдана!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
