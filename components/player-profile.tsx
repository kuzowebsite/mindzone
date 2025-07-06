"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import { ref, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { GuideModal, RulesModal } from "./help-modal"
import {
  Crown,
  User,
  Star,
  Calendar,
  LogOut,
  Settings,
  Edit,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  Copy,
  BookOpen,
  Trophy,
  Check,
  Wallet,
} from "lucide-react"

export function PlayerProfile() {
  const { user, userProfile, logout, updateInternalAccount } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Account name editing states
  const [isEditingAccountName, setIsEditingAccountName] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [accountNameLoading, setAccountNameLoading] = useState(false)

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileImage, setProfileImage] = useState(userProfile?.profileImage || "")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (!user || !userProfile) return null

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userProfile.playerId.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy ID:", err)
    }
  }

  const handleUpdateAccountName = async () => {
    if (!newAccountName.trim()) {
      setError("Шинэ дансны нэр оруулна уу")
      return
    }

    setAccountNameLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await updateInternalAccount(newAccountName.trim())
      setSuccess(result.message)
      setIsEditingAccountName(false)
      setNewAccountName("")
    } catch (err: any) {
      setError(err.message || "Дансны нэр өөрчлөхөд алдаа гарлаа")
    } finally {
      setAccountNameLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Зургийн хэмжээ 2MB-аас бага байх ёстой")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Зөвхөн зургийн файл оруулна уу")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      setProfileImage(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate inputs
      if (!displayName.trim()) {
        setError("Нэр оруулна уу")
        return
      }

      if (!email.trim()) {
        setError("И-мэйл хаяг оруулна уу")
        return
      }

      // If changing password, validate
      if (newPassword) {
        if (!currentPassword) {
          setError("Одоогийн нууц үгээ оруулна уу")
          return
        }

        if (newPassword !== confirmPassword) {
          setError("Шинэ нууц үг таарахгүй байна")
          return
        }

        if (newPassword.length < 6) {
          setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")
          return
        }
      }

      // Re-authenticate if changing email or password
      if (email !== user.email || newPassword) {
        if (!currentPassword) {
          setError("Одоогийн нууц үгээ оруулна уу")
          return
        }

        const credential = EmailAuthProvider.credential(user.email!, currentPassword)
        await reauthenticateWithCredential(user, credential)
      }

      // Update display name
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName })
      }

      // Update email
      if (email !== user.email) {
        await updateEmail(user, email)
      }

      // Update password
      if (newPassword) {
        await updatePassword(user, newPassword)
      }

      // Update profile in database
      const updates: any = {
        [`users/${user.uid}/displayName`]: displayName,
        [`users/${user.uid}/email`]: email,
      }

      if (profileImage !== userProfile.profileImage) {
        updates[`users/${user.uid}/profileImage`] = profileImage
      }

      await update(ref(database), updates)

      setSuccess("Профайл амжилттай шинэчлэгдлээ!")
      setIsEditing(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      console.error("Profile update error:", err)
      if (err.code === "auth/wrong-password") {
        setError("Одоогийн нууц үг буруу байна")
      } else if (err.code === "auth/email-already-in-use") {
        setError("Энэ и-мэйл хаяг аль хэдийн ашиглагдаж байна")
      } else if (err.code === "auth/invalid-email") {
        setError("И-мэйл хаягийн формат буруу байна")
      } else {
        setError("Профайл шинэчлэхэд алдаа гарлаа: " + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setDisplayName(user?.displayName || "")
    setEmail(user?.email || "")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setProfileImage(userProfile?.profileImage || "")
    setError("")
    setSuccess("")
  }

  const handleCancelAccountNameEdit = () => {
    setIsEditingAccountName(false)
    setNewAccountName("")
    setError("")
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-300 mb-2">Миний профайл</h2>
        <p className="text-amber-200 text-sm">Хувийн мэдээлэл болон статистик</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="gaming-card rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3 text-green-300">
            <Star className="h-5 w-5" />
            <span className="font-semibold text-sm">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="gaming-card rounded-2xl p-4 border border-red-500/30">
          <div className="flex items-center gap-3 text-red-300">
            <X className="h-5 w-5" />
            <span className="font-semibold text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <Card className="premium-card glow-pulse">
        <CardHeader className="text-center">
          <div className="character-container w-20 h-20 mx-auto mb-4 flex items-center justify-center float-animation">
            {isEditing ? (
              <div className="relative">
                <div className="coin-icon w-16 h-16 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Crown className="h-8 w-8 text-amber-900" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 cursor-pointer hover:bg-amber-600 transition-colors">
                  <Upload className="h-3 w-3 text-black" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="coin-icon w-16 h-16 flex items-center justify-center overflow-hidden">
                {userProfile.profileImage ? (
                  <img
                    src={userProfile.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Crown className="h-8 w-8 text-amber-900" />
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Хэрэглэгчийн нэр"
                className="gaming-card border-amber-500/30 text-white text-center text-xl font-bold"
              />
            </div>
          ) : (
            <CardTitle className="text-2xl font-bold text-amber-300">{user.displayName}</CardTitle>
          )}

          <CardDescription className="text-amber-400 flex items-center justify-center gap-1">
            <User className="h-4 w-4" />
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer"
              title="ID хуулах"
            >
              #{userProfile.playerId}
              {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </CardDescription>

          {/* Internal Account Info */}
          {userProfile.internalAccount && (
            <div className="mt-4 p-3 gaming-card rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-amber-400">Дотоод данс</div>
                {!isEditingAccountName && userProfile.internalAccount.changeCount < 2 && (
                  <Button
                    onClick={() => {
                      setIsEditingAccountName(true)
                      setNewAccountName(userProfile.internalAccount?.displayName || "")
                    }}
                    variant="outline"
                    size="sm"
                    className="gaming-card border-amber-500/30 text-amber-300 hover:bg-amber-500/20 bg-transparent h-6 px-2 text-xs"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Засах
                  </Button>
                )}
              </div>

              <div className="text-lg font-mono text-amber-300 mb-1">#{userProfile.internalAccount.accountNumber}</div>

              {isEditingAccountName ? (
                <div className="space-y-2 mt-3">
                  <Input
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Шинэ дансны нэр"
                    className="gaming-card border-amber-500/30 text-white text-sm"
                    maxLength={20}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateAccountName}
                      disabled={accountNameLoading}
                      size="sm"
                      className="flex-1 h-8 text-xs premium-button text-black"
                    >
                      {accountNameLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent mr-1"></div>
                          Хадгалж байна...
                        </>
                      ) : (
                        <>
                          <Save className="mr-1 h-3 w-3" />
                          Хадгалах
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelAccountNameEdit}
                      variant="outline"
                      size="sm"
                      className="gaming-card border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent h-8 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Цуцлах
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm text-amber-300 font-medium">{userProfile.internalAccount.displayName}</div>
                  <div className="text-xs text-amber-500 mt-1 flex items-center justify-between">
                    <span>{new Date(userProfile.internalAccount.createdAt).toLocaleDateString("mn-MN")}</span>
                    <span className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      {2 - userProfile.internalAccount.changeCount} удаа өөрчлөх боломжтой
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="stats-card p-3 text-center rounded-lg">
              <div className="text-lg font-bold text-blue-400">{userProfile.gamesPlayed}</div>
              <div className="text-xs text-blue-300">Тоглосон</div>
            </div>
            <div className="stats-card p-3 text-center rounded-lg">
              <div className="text-lg font-bold text-purple-400">{userProfile.highestScore}</div>
              <div className="text-xs text-purple-300">Дээд оноо</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Бүртгэлийн мэдээлэл
            </CardTitle>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="gaming-card border-amber-500/30 text-amber-300 hover:bg-amber-500/20 bg-transparent"
              >
                <Edit className="mr-2 h-4 w-4" />
                Засах
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-amber-300 mb-2 block">И-мэйл хаяг</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="gaming-card border-amber-500/30 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-amber-300 mb-2 block">Одоогийн нууц үг</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Одоогийн нууц үгээ оруулна уу"
                    className="gaming-card border-amber-500/30 text-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-amber-300 mb-2 block">
                  Шинэ нууц үг (хоосон үлдээвэл өөрчлөгдөхгүй)
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Шинэ нууц үг"
                    className="gaming-card border-amber-500/30 text-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="text-sm font-medium text-amber-300 mb-2 block">Шинэ нууц үг баталгаажуулах</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Шинэ нууц үгээ дахин оруулна уу"
                      className="gaming-card border-amber-500/30 text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 h-12 font-bold premium-button text-black"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Хадгалах
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="gaming-card border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Цуцлах
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-3 gaming-card rounded-lg">
                <span className="text-amber-200 text-sm">И-мэйл:</span>
                <span className="text-amber-300 text-sm font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between items-center p-3 gaming-card rounded-lg">
                <span className="text-amber-200 text-sm">Бүртгүүлсэн:</span>
                <span className="text-amber-300 text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(userProfile.createdAt).toLocaleDateString("mn-MN")}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 gaming-card rounded-lg">
                <span className="text-amber-200 text-sm">Сүүлд нэвтэрсэн:</span>
                <span className="text-amber-300 text-sm">
                  {new Date(userProfile.lastLoginAt).toLocaleDateString("mn-MN")}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Guide Section */}
      {!isEditing && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Заавар
            </CardTitle>
            <CardDescription className="text-amber-400">Тусламж болон мэдээлэл</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setShowGuideModal(true)}
              variant="outline"
              className="w-full h-12 gaming-card border-blue-500/30 text-blue-300 hover:bg-blue-500/20 bg-transparent flex items-center gap-3 justify-start"
            >
              <div className="coin-icon w-8 h-8 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-amber-900" />
              </div>
              <div className="text-left">
                <div className="font-bold">Сайтын заавар</div>
                <div className="text-xs opacity-80">Сайтыг хэрхэн ашиглах</div>
              </div>
            </Button>

            <Button
              onClick={() => setShowRulesModal(true)}
              variant="outline"
              className="w-full h-12 gaming-card border-purple-500/30 text-purple-300 hover:bg-purple-500/20 bg-transparent flex items-center gap-3 justify-start"
            >
              <div className="coin-icon w-8 h-8 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-amber-900" />
              </div>
              <div className="text-left">
                <div className="font-bold">Тоглоомын дүрэм</div>
                <div className="text-xs opacity-80">Squad Game дүрэм</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!isEditing && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-amber-300">Үйлдлүүд</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full h-12 gaming-card border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Системээс гарах
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <GuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
    </div>
  )
}
