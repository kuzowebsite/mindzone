"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, AlertTriangle, Eye, EyeOff, UserPlus, LogIn, Trophy, Users } from "lucide-react"

export function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [newUserProfile, setNewUserProfile] = useState<any>(null)
  const [acceptedEULA, setAcceptedEULA] = useState(false)
  const [acceptedAge, setAcceptedAge] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form state for signup
  const [signupForm, setSignupForm] = useState({
    displayName: "",
    email: "",
    password: "",
  })

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!acceptedEULA || !acceptedAge) {
      setError("Та бүх нөхцлийг хүлээн зөвшөөрөх ёстой")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await signIn(email, password)
      // Don't set success message here - let the auth state change handle the redirect
    } catch (err: any) {
      console.error("Sign in error:", err)

      // Handle specific Firebase auth errors
      if (err.code === "auth/invalid-credential") {
        setError("И-мэйл хаяг эсвэл нууц үг буруу байна. Дахин оролдоно уу.")
      } else if (err.code === "auth/user-not-found") {
        setError("Энэ и-мэйл хаягаар бүртгүүлсэн хэрэглэгч олдсонгүй.")
      } else if (err.code === "auth/wrong-password") {
        setError("Нууц үг буруу байна.")
      } else if (err.code === "auth/invalid-email") {
        setError("И-мэйл хаягийн формат буруу байна.")
      } else if (err.code === "auth/user-disabled") {
        setError("Энэ бүртгэл түр хаагдсан байна.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Хэт олон удаа буруу оролдлого хийсэн байна. Түр хүлээгээд дахин оролдоно уу.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Интернэт холболтын алдаа. Холболтоо шалгаад дахин оролдоно уу.")
      } else {
        setError("Нэвтрэх үед алдаа гарлаа: " + (err.message || "Тодорхойгүй алдаа"))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!acceptedEULA || !acceptedAge) {
      setError("Та бүх нөхцлийг хүлээн зөвшөөрөх ёстой")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    // Store form reference before async operations
    const form = e.currentTarget

    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const displayName = formData.get("displayName") as string

    try {
      // Always register as player
      const result = await signUp(email, password, displayName, "player")

      const { ref, get } = await import("firebase/database")
      const { database } = await import("@/lib/firebase")

      if (database) {
        const profileRef = ref(database, `users/${result.user.uid}`)
        const profileSnapshot = await get(profileRef)
        const profile = profileSnapshot.val()
        setNewUserProfile(profile)
      }

      // Clear success message and profile after successful signup
      // The auth state change will handle the redirect automatically
      setSuccess("")
      setNewUserProfile(null)

      // Reset form using state instead of form.reset()
      setSignupForm({
        displayName: "",
        email: "",
        password: "",
      })

      // Reset form using traditional method with null check
      if (form && typeof form.reset === "function") {
        try {
          form.reset()
        } catch (resetError) {
          console.warn("Could not reset form:", resetError)
        }
      }

      // Reset checkboxes
      setAcceptedEULA(false)
      setAcceptedAge(false)
    } catch (err: any) {
      console.error("Sign up error:", err)

      // Handle specific Firebase auth errors
      if (err.code === "auth/email-already-in-use") {
        setError("Энэ и-мэйл хаяг аль хэдийн ашиглагдаж байна.")
      } else if (err.code === "auth/invalid-email") {
        setError("И-мэйл хаягийн формат буруу байна.")
      } else if (err.code === "auth/operation-not-allowed") {
        setError("И-мэйл/нууц үгээр бүртгүүлэх боломжгүй байна.")
      } else if (err.code === "auth/weak-password") {
        setError("Нууц үг хэтэрхий энгийн байна. Илүү хүчтэй нууц үг ашиглана уу.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Интернэт холболтын алдаа. Холболтоо шалгаад дахин оролдоно уу.")
      } else {
        setError("Бүртгүүлэх үед алдаа гарлаа: " + (err.message || "Тодорхойгүй алдаа"))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignupInputChange = (field: string, value: string) => {
    setSignupForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="mobile-optimized dark-premium relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 golden-gradient rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 golden-gradient rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="premium-card glow-pulse">
            <CardContent className="p-6">
              {/* Age Warning */}
              <div className="gaming-card rounded-2xl p-4 mb-6 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <div className="coin-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-900" />
                  </div>
                  <div className="text-sm">
                    <h3 className="font-bold text-amber-300 mb-2">⚠️ Анхааруулга</h3>
                    <p className="text-amber-200 mb-2 text-xs">
                      Энэхүү тоглоом нь мэдлэг, логик сэтгэлгээ, даалгаврын биелэлт дээр суурилсан тэмцээн юм.
                    </p>
                    <p className="text-amber-200 font-semibold text-xs">🔞 18+ насны шаардлага</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 gaming-card border border-amber-500/20 mb-6">
                  <TabsTrigger
                    value="signin"
                    className="text-amber-200 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Нэвтрэх
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="text-amber-200 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Бүртгүүлэх
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">И-мэйл хаяг</label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="example@email.com"
                          required
                          disabled={loading}
                          className="gaming-card border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-400 h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">Нууц үг</label>
                        <div className="relative">
                          <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                            className="gaming-card border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-400 h-12 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="age-consent"
                          checked={acceptedAge}
                          onCheckedChange={setAcceptedAge}
                          className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 mt-1"
                        />
                        <label htmlFor="age-consent" className="text-sm text-amber-200 leading-5">
                          Би 18-аас дээш настай эсвэл эцэг эхийн зөвшөөрөлтэй байна
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="eula-consent"
                          checked={acceptedEULA}
                          onCheckedChange={setAcceptedEULA}
                          className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 mt-1"
                        />
                        <label htmlFor="eula-consent" className="text-sm text-amber-200 leading-5">
                          Би{" "}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                type="button"
                                className="text-amber-400 underline hover:text-amber-300 transition-colors"
                              >
                                Хэрэглэгчийн Лицензийн Гэрээг
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto gaming-card border-amber-500/30">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text golden-gradient">
                                  Squad Game: EULA
                                </DialogTitle>
                                <DialogDescription className="text-amber-300">
                                  Сүүлд шинэчилсэн: 2025-07-05
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 text-sm text-amber-200 max-h-96 overflow-y-auto">
                                <p>
                                  Энэхүү аппликэйшн (цаашид "Тоглоом" гэх)-д нэвтэрч, хэрэглэж эхэлснээр та дараах
                                  нөхцлийг бүрэн уншиж танилцсан, ойлгосон бөгөөд хүлээн зөвшөөрсөнд тооцно.
                                </p>
                                <div className="space-y-3">
                                  <div className="stats-card p-3 rounded">
                                    <h3 className="font-bold text-amber-400 mb-1">1. Тоглоомын зорилго</h3>
                                    <p className="text-xs">
                                      Энэхүү тоглоом нь мэдлэг, ур чадварыг шалгах зорилготой, олон шатлалт даалгавартай
                                      тэмцээний платформ юм.
                                    </p>
                                  </div>
                                  <div className="stats-card p-3 rounded">
                                    <h3 className="font-bold text-amber-400 mb-1">2. Насны шаардлага</h3>
                                    <p className="text-xs">
                                      Тоглоомд оролцох доод нас нь <strong>18 нас</strong> байна.
                                    </p>
                                  </div>
                                  <div className="stats-card p-3 rounded">
                                    <h3 className="font-bold text-amber-400 mb-1">3. Шагнал болон төлбөр</h3>
                                    <p className="text-xs">
                                      Тоглоомд оролцохын тулд хэрэглэгч тодорхой хэмжээний тасалбар худалдан авна.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>{" "}
                          уншиж, хүлээн зөвшөөрч байна
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-bold premium-button text-black"
                      disabled={loading || !acceptedEULA || !acceptedAge}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Нэвтэрч байна...
                        </>
                      ) : (
                        <>
                          <Trophy className="mr-2 h-5 w-5" />
                          Тэмцээнд нэвтрэх
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">Хэрэглэгчийн нэр</label>
                        <Input
                          name="displayName"
                          type="text"
                          placeholder="Таны тоглоомын нэр"
                          value={signupForm.displayName}
                          onChange={(e) => handleSignupInputChange("displayName", e.target.value)}
                          required
                          disabled={loading}
                          className="gaming-card border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-400 h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">И-мэйл хаяг</label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="example@email.com"
                          value={signupForm.email}
                          onChange={(e) => handleSignupInputChange("email", e.target.value)}
                          required
                          disabled={loading}
                          className="gaming-card border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-400 h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-amber-300 mb-2 block">Нууц үг</label>
                        <div className="relative">
                          <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={signupForm.password}
                            onChange={(e) => handleSignupInputChange("password", e.target.value)}
                            required
                            disabled={loading}
                            className="gaming-card border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-400 h-12 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="age-consent-signup"
                          checked={acceptedAge}
                          onCheckedChange={setAcceptedAge}
                          className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 mt-1"
                        />
                        <label htmlFor="age-consent-signup" className="text-sm text-amber-200 leading-5">
                          Би 18-аас дээш настай эсвэл эцэг эхийн зөвшөөрөлтэй байна
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="eula-consent-signup"
                          checked={acceptedEULA}
                          onCheckedChange={setAcceptedEULA}
                          className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 mt-1"
                        />
                        <label htmlFor="eula-consent-signup" className="text-sm text-amber-200 leading-5">
                          Би{" "}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                type="button"
                                className="text-amber-400 underline hover:text-amber-300 transition-colors"
                              >
                                Хэрэглэгчийн Лицензийн Гэрээг
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto gaming-card border-amber-500/30">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text golden-gradient">
                                  Squad Game: EULA
                                </DialogTitle>
                                <DialogDescription className="text-amber-300">
                                  Сүүлд шинэчилсэн: 2025-07-05
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 text-sm text-amber-200 max-h-96 overflow-y-auto">
                                <p>
                                  Энэхүү аппликэйшн (цаашид "Тоглоом" гэх)-д нэвтэрч, хэрэглэж эхэлснээр та дараах
                                  нөхцлийг бүрэн уншиж танилцсан, ойлгосон бөгөөд хүлээн зөвшөөрсөнд тооцно.
                                </p>
                                <div className="space-y-3">
                                  <div className="stats-card p-3 rounded">
                                    <h3 className="font-bold text-amber-400 mb-1">1. Тоглоомын зорилго</h3>
                                    <p className="text-xs">
                                      Энэхүү тоглоом нь мэдлэг, ур чадварыг шалгах зорилготой, олон шатлалт даалгавартай
                                      тэмцээний платформ юм.
                                    </p>
                                  </div>
                                  <div className="stats-card p-3 rounded">
                                    <h3 className="font-bold text-amber-400 mb-1">2. Насны шаардлага</h3>
                                    <p className="text-xs">
                                      Тоглоомд оролцох доод нас нь <strong>18 нас</strong> байна.
                                    </p>
                                  </div>
                                  <div className="stats-card p-3 rounded">
                                    <h3 className="font-bold text-amber-400 mb-1">3. Шагнал болон төлбөр</h3>
                                    <p className="text-xs">
                                      Тоглоомд оролцохын тулд хэрэглэгч тодорхой хэмжээний тасалбар худалдан авна.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>{" "}
                          уншиж, хүлээн зөвшөөрч байна
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-bold premium-button text-black"
                      disabled={loading || !acceptedEULA || !acceptedAge}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Бүртгүүлж байна...
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-5 w-5" />
                          Тоглогчоор бүртгүүлэх
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {error && (
                <div className="gaming-card rounded-2xl p-4 mt-4 border border-red-500/30">
                  <div className="flex items-center gap-3 text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold text-sm">{error}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading Progress */}
          {loading && (
            <div className="mt-6 text-center">
              <div className="level-bar w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full level-bar animate-pulse"></div>
              </div>
              <p className="text-amber-300 text-sm mt-2 font-medium">LOADING...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
