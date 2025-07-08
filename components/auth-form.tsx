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
  const { signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth()
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
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

  const handleSocialSignIn = async (provider: "google" | "facebook" | "apple") => {
    setSocialLoading(provider)
    setError("")
    setSuccess("")

    try {
      let result
      switch (provider) {
        case "google":
          result = await signInWithGoogle()
          break
        case "facebook":
          result = await signInWithFacebook()
          break
        case "apple":
          result = await signInWithApple()
          break
        default:
          throw new Error("Дэмжигдээгүй нэвтрэх арга")
      }

      // If we get here, authentication was successful
      console.log("Social login successful:", result)
      // Don't set any success message - let auth state change handle redirect
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err)

      // Only show error if authentication actually failed
      // Don't show error for popup-closed-by-user as it might still be successful
      if (err.code === "auth/popup-blocked") {
        setError("Popup цонх блоклогдсон байна. Браузерын тохиргоог шалгана уу")
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError("Энэ и-мэйл хаяг өөр нэвтрэх аргаар бүртгэгдсэн байна")
      } else if (err.code === "auth/network-request-failed") {
        setError("Интернэт холболтын алдаа. Холболтоо шалгаад дахин оролдоно уу")
      } else if (err.code === "auth/cancelled-popup-request") {
        // User cancelled, don't show error
        console.log("User cancelled social login")
      } else if (err.code === "auth/popup-closed-by-user") {
        // Don't show error immediately - wait a moment to see if auth state changes
        console.log("Popup closed by user, checking auth state...")
        setTimeout(() => {
          // Only show error if still loading after 2 seconds
          if (socialLoading === provider) {
            setError("Нэвтрэх цонх хаагдсан байна. Дахин оролдоно уу")
            setSocialLoading(null)
          }
        }, 2000)
        return // Don't clear loading state immediately
      } else if (err.message && !err.message.includes("popup")) {
        setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)}-ээр нэвтрэх үед алдаа гарлаа: ${err.message}`)
      }
    } finally {
      // Only clear loading if we're not waiting for auth state change
      if (!error.includes("хаагдсан")) {
        setSocialLoading(null)
      }
    }
  }

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

              {/* Checkboxes - moved to top for social login */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="age-consent-global"
                    checked={acceptedAge}
                    onCheckedChange={setAcceptedAge}
                    className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 mt-1"
                  />
                  <label htmlFor="age-consent-global" className="text-sm text-amber-200 leading-5">
                    Би 18-аас дээш настай эсвэл эцэг эхийн зөвшөөрөлтэй байна
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="eula-consent-global"
                    checked={acceptedEULA}
                    onCheckedChange={setAcceptedEULA}
                    className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 mt-1"
                  />
                  <label htmlFor="eula-consent-global" className="text-sm text-amber-200 leading-5">
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
                          <DialogDescription className="text-amber-300">Сүүлд шинэчилсэн: 2025-07-05</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-amber-200 max-h-96 overflow-y-auto">
                          <p>
                            Энэхүү аппликэйшн (цаашид "Тоглоом" гэх)-д нэвтэрч, хэрэглэж эхэлснээр та дараах нөхцлийг
                            бүрэн уншиж танилцсан, ойлгосон бөгөөд хүлээн зөвшөөрсөнд тооцно.
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

              {/* Social Login Section */}
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <p className="text-amber-300 text-sm font-medium mb-4">Хурдан нэвтрэх</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Google Login */}
                  <Button
                    onClick={() => handleSocialSignIn("google")}
                    disabled={socialLoading !== null}
                    className="h-12 gaming-card border border-amber-500/30 hover:border-amber-400 bg-transparent text-white hover:bg-amber-500/10 transition-all duration-200"
                  >
                    {socialLoading === "google" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </>
                    )}
                  </Button>

                  {/* Facebook Login */}
                  <Button
                    onClick={() => handleSocialSignIn("facebook")}
                    disabled={socialLoading !== null}
                    className="h-12 gaming-card border border-amber-500/30 hover:border-amber-400 bg-transparent text-white hover:bg-amber-500/10 transition-all duration-200"
                  >
                    {socialLoading === "facebook" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </>
                    )}
                  </Button>

                  {/* Apple Login */}
                  <Button
                    onClick={() => handleSocialSignIn("apple")}
                    disabled={socialLoading !== null}
                    className="h-12 gaming-card border border-amber-500/30 hover:border-amber-400 bg-transparent text-white hover:bg-amber-500/10 transition-all duration-200"
                  >
                    {socialLoading === "apple" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C8.396 0 8.025.044 8.025.044c0 0-.396.044-.396.044C3.521.088 0 3.609 0 8.017c0 4.408 3.521 7.929 7.629 7.973 0 0 .396.044.396.044s.396-.044.396-.044C12.529 15.946 16.05 12.425 16.05 8.017c0-4.408-3.521-7.929-7.629-7.973 0 0-.396-.044-.396-.044S12.396 0 12.017 0zm2.274 6.634c-.28.02-.558.08-.82.18-.262.1-.502.24-.71.42-.208.18-.378.39-.51.63-.132.24-.198.5-.198.78 0 .28.066.54.198.78.132.24.302.45.51.63.208.18.448.32.71.42.262.1.54.16.82.18.28-.02.558-.08.82-.18.262-.1.502-.24.71-.42.208-.18.378-.39.51-.63.132-.24.198-.5.198-.78 0-.28-.066-.54-.198-.78-.132-.24-.302-.45-.51-.63-.208-.18-.448-.32-.71-.42-.262-.1-.54-.16-.82-.18z" />
                        </svg>
                        Apple
                      </>
                    )}
                  </Button>

                  {/* Game Center Login (iOS only) */}
                  <Button
                    onClick={() => {
                      setError("Game Center нэвтрэх одоогоор дэмжигдэхгүй байна")
                    }}
                    disabled={true}
                    className="h-12 gaming-card border border-gray-600/30 bg-transparent text-gray-500 cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Game Center
                  </Button>
                </div>
              </div>
              <p className="text-xs text-amber-200/70 text-center mt-2">
                Нийгмийн сүлжээгээр нэвтрэх нь автоматаар нөхцлүүдийг хүлээн зөвшөөрсөнд тооцогдоно
              </p>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-500/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900 text-amber-300">эсвэл</span>
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
          {(loading || socialLoading) && (
            <div className="mt-6 text-center">
              <div className="level-bar w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full level-bar animate-pulse"></div>
              </div>
              <p className="text-amber-300 text-sm mt-2 font-medium">
                {socialLoading ? `${socialLoading.toUpperCase()}-ээр нэвтэрч байна...` : "LOADING..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
