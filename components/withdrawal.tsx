"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { TransferModal } from "@/components/modals/transfer-modal"
import { DepositModal } from "@/components/modals/deposit-modal"
import { WithdrawModal } from "@/components/modals/withdraw-modal"
import { TransactionHistoryModal } from "@/components/modals/transaction-history-modal"
import { useCustomAlert } from "@/components/ui/custom-alert"
import { database } from "@/lib/firebase"
import {
  DollarSign,
  Wallet,
  Copy,
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Plus,
  Save,
  X,
  History,
} from "lucide-react"

export function Withdrawal() {
  const { user, userProfile, transferMoney, createInternalAccount } = useAuth()
  const [copied, setCopied] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const { showError, showWarning, showSuccess, showInfo, AlertComponent } = useCustomAlert()

  // Account creation states
  const [showAccountCreation, setShowAccountCreation] = useState(false)
  const [newAccountNumber, setNewAccountNumber] = useState("")
  const [accountCreationLoading, setAccountCreationLoading] = useState(false)
  const [accountError, setAccountError] = useState("")

  // Early return with loading state if data is not available
  if (!user || !userProfile) {
    return (
      <div className="space-y-6 pb-24">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-300 mb-2">Мөнгөний гүйлгээ</h2>
          <p className="text-amber-200 text-sm">Ачааллаж байна...</p>
        </div>
        <Card className="premium-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-amber-300">Мэдээлэл ачааллаж байна...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalWinnings = userProfile.totalWinnings || 0
  const internalAccount = userProfile.internalAccount
  const hasInternalAccount = !!internalAccount

  const handleCreateAccount = async () => {
    if (!newAccountNumber.trim()) {
      setAccountError("Дансны дугаар оруулна уу")
      return
    }

    setAccountCreationLoading(true)
    setAccountError("")

    try {
      await createInternalAccount(newAccountNumber.trim())
      showSuccess(
        "Данс амжилттай үүсгэгдлээ!",
        "Одоо та мөнгө шилжүүлэх, татах үйлдлүүд хийх боломжтой боллоо.",
        <Wallet className="h-8 w-8 text-white" />,
      )
      setShowAccountCreation(false)
      setNewAccountNumber("")
    } catch (err: any) {
      setAccountError(err.message || "Данс үүсгэхэд алдаа гарлаа")
    } finally {
      setAccountCreationLoading(false)
    }
  }

  const handleCopyAccountNumber = async () => {
    if (!internalAccount) return

    try {
      await navigator.clipboard.writeText(internalAccount.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy account number:", err)
      // Fallback for browsers that don't support clipboard API
      showInfo(
        "Дансны дугаар",
        `Дансны дугаар: ${internalAccount.accountNumber}`,
        <Copy className="h-8 w-8 text-white" />,
      )
    }
  }

  const handleLookupAccount = async (accountNumber: string) => {
    if (!database) {
      throw new Error("Firebase not initialized")
    }

    try {
      // Import Firebase functions
      const { ref, get } = await import("firebase/database")

      // Check if account exists in internal accounts
      const accountRef = ref(database, `internalAccounts/${accountNumber}`)
      const snapshot = await get(accountRef)

      if (!snapshot.exists()) {
        return null
      }

      const accountData = snapshot.val()

      // Get full user profile to get the display name
      const userRef = ref(database, `users/${accountData.uid}`)
      const userSnapshot = await get(userRef)

      if (!userSnapshot.exists()) {
        return null
      }

      const userData = userSnapshot.val()
      return {
        displayName: userData.internalAccount?.displayName || userData.displayName || "Тодорхойгүй",
      }
    } catch (error) {
      console.error("Account lookup error:", error)
      throw error
    }
  }

  const handleTransfer = async (accountNumber: string, amount: number, description: string) => {
    try {
      const result = await transferMoney(accountNumber, amount, description)
      showSuccess(
        "Амжилттай шилжүүллээ!",
        `${amount.toLocaleString()}₮-г ${result.recipientName} руу амжилттай шилжүүллээ!`,
        <ArrowRightLeft className="h-8 w-8 text-white" />,
      )
    } catch (error: any) {
      showError("Гүйлгээний алдаа", error.message, <AlertTriangle className="h-8 w-8 text-white" />)
    }
  }

  const handleDeposit = async (amount: number, bankName: string, accountNumber: string, accountHolderName: string) => {
    if (!user || !userProfile || !userProfile.internalAccount || !database) {
      showError("Алдаа", "Системд нэвтэрч орох шаардлагатай!", <AlertTriangle className="h-8 w-8 text-white" />)
      return
    }

    try {
      // Import Firebase functions
      const { ref, push } = await import("firebase/database")
      const { database } = await import("@/lib/firebase")

      // Create deposit request
      const depositRequest = {
        playerId: userProfile.playerId.toString(),
        playerName: userProfile.displayName,
        playerUid: user.uid,
        internalAccount: userProfile.internalAccount,
        amount,
        bankAccount: {
          bankName,
          accountNumber,
          accountHolderName,
        },
        status: "pending",
        requestedAt: Date.now(),
      }

      // Save to Firebase
      const depositRequestsRef = ref(database, "depositRequests")
      await push(depositRequestsRef, depositRequest)

      showSuccess(
        "Цэнэглэх хүсэлт илгээгдлээ!",
        `${amount.toLocaleString()}₮ цэнэглэх хүсэлт амжилттай илгээгдлээ. Админ шалгаж баталгаажуулна.`,
        <ArrowUpCircle className="h-8 w-8 text-white" />,
      )
    } catch (error) {
      console.error("Deposit request error:", error)
      showError(
        "Хүсэлт илгээхэд алдаа гарлаа",
        "Дахин оролдоно уу эсвэл админтай холбогдоно уу.",
        <AlertTriangle className="h-8 w-8 text-white" />,
      )
    }
  }

  const handleWithdraw = async (amount: number, bankName: string, accountNumber: string, accountHolderName: string) => {
    if (!user || !userProfile || !userProfile.internalAccount || !database) {
      showError("Алдаа", "Системд нэвтэрч орох шаардлагатай!", <AlertTriangle className="h-8 w-8 text-white" />)
      return
    }

    try {
      // Import Firebase functions
      const { ref, push } = await import("firebase/database")
      const { database } = await import("@/lib/firebase")

      // Create withdrawal request
      const withdrawalRequest = {
        playerId: userProfile.playerId.toString(),
        playerName: userProfile.displayName,
        playerUid: user.uid,
        internalAccount: userProfile.internalAccount,
        amount,
        bankAccount: {
          bankName,
          accountNumber,
          accountHolderName,
        },
        status: "pending",
        requestedAt: Date.now(),
      }

      // Save to Firebase
      const withdrawalRequestsRef = ref(database, "withdrawalRequests")
      await push(withdrawalRequestsRef, withdrawalRequest)

      showSuccess(
        "Татах хүсэлт илгээгдлээ!",
        `${amount.toLocaleString()}₮ татах хүсэлт амжилттай илгээгдлээ. Админ 2 минутын дотор шилжүүлнэ.`,
        <ArrowDownCircle className="h-8 w-8 text-white" />,
      )
    } catch (error) {
      console.error("Withdrawal request error:", error)
      showError(
        "Хүсэлт илгээхэд алдаа гарлаа",
        "Дахин оролдоно уу эсвэл админтай холбогдоно уу.",
        <AlertTriangle className="h-8 w-8 text-white" />,
      )
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-300 mb-2">Мөнгөний гүйлгээ</h2>
        <p className="text-amber-200 text-sm">Мөнгө цэнэглэх, татах болон гүйлгээ хийх</p>
      </div>

      {/* Account Creation Required */}
      {!hasInternalAccount && !showAccountCreation && (
        <Card className="premium-card border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-300 mb-2">Данс үүсгэх шаардлагатай</h3>
                <p className="text-orange-200 text-sm mb-4">
                  Мөнгө шилжүүлэх, татах үйлдлүүд хийхийн тулд дотоод данс үүсгэх хэрэгтэй
                </p>
                <Button
                  onClick={() => setShowAccountCreation(true)}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Данс үүсгэх
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Creation Form */}
      {showAccountCreation && (
        <Card className="premium-card border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">Шинэ данс үүсгэх</h3>
              <p className="text-blue-400 text-sm">8 оронтой дугаар оруулна уу. Данс нэг удаа л үүсгэх боломжтой!</p>
            </div>

            {accountError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-300">
                  <X className="h-4 w-4" />
                  <span className="text-sm">{accountError}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-amber-300 mb-2 block">Дансны дугаар</label>
                <Input
                  type="text"
                  value={newAccountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 8)
                    setNewAccountNumber(value)
                    setAccountError("")
                  }}
                  placeholder="12345678"
                  maxLength={8}
                  className="gaming-card border-amber-500/30 text-white text-center text-lg font-mono h-12"
                />
                <p className="text-xs text-amber-400 mt-2">
                  Зөвхөн тоо оруулна уу. Данс үүсгэсний дараа өөрчлөх боломжгүй!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateAccount}
                  disabled={accountCreationLoading || newAccountNumber.length !== 8}
                  className="flex-1 h-12 font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black"
                >
                  {accountCreationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                      Үүсгэж байна...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Данс үүсгэх
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowAccountCreation(false)
                    setNewAccountNumber("")
                    setAccountError("")
                  }}
                  variant="outline"
                  className="gaming-card border-red-500/30 text-red-300 hover:bg-red-500/20 bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Цуцлах
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Display */}
      {hasInternalAccount && (
        <>
          {/* Дансны мэдээлэл ба үлдэгдэл */}
          <div className="relative overflow-hidden">
            {/* Background with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-pulse rounded-3xl"></div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/50 via-yellow-400/50 to-amber-400/50 p-[2px] animate-pulse">
              <div className="h-full w-full rounded-3xl bg-gray-900/95"></div>
            </div>

            <Card className="relative border-0 bg-transparent backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Header with icons */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <DollarSign className="h-6 w-6 text-gray-900 font-bold" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-amber-200/80 uppercase tracking-wider">
                        {internalAccount.displayName}
                      </h3>
                      <p className="text-xs text-amber-300/60">Дансны нэр</p>
                    </div>
                  </div>

                  {/* History Button */}
                  <Button
                    onClick={() => setShowHistoryModal(true)}
                    variant="outline"
                    size="sm"
                    className="gaming-card border-purple-500/30 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                  >
                    <History className="mr-2 h-4 w-4" />
                    Хуулга
                  </Button>
                </div>

                {/* Account Number */}
                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-amber-300/80 uppercase tracking-widest mb-2">Дансны дугаар</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-mono font-bold text-amber-300">{internalAccount.accountNumber}</span>
                    <button
                      onClick={handleCopyAccountNumber}
                      className="text-amber-400 hover:text-amber-300 transition-colors"
                      title="Хуулах"
                    >
                      {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="text-center mb-8">
                  <div className="mb-2">
                    <p className="text-sm font-medium text-amber-300/80 uppercase tracking-widest mb-1">
                      Нийт үлдэгдэл
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">ACTIVE</span>
                    </div>
                  </div>

                  {/* Main balance with glow effect */}
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-green-400/20 rounded-lg"></div>
                    <div className="relative text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 mb-2 font-mono tracking-tight">
                      {totalWinnings.toLocaleString()}₮
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <span className="text-sm font-medium text-green-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Боломжтой дүн
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4">
            {/* Гүйлгээ */}
            <button
              onClick={() => {
                if (totalWinnings <= 0) {
                  showError(
                    "Хангалтгүй үлдэгдэл",
                    "Гүйлгээ хийх мөнгө байхгүй байна!",
                    <DollarSign className="h-8 w-8 text-white" />,
                  )
                  return
                }
                setShowTransferModal(true)
              }}
              className="p-6 text-center rounded-2xl transition-all duration-300 hover:bg-blue-500/20 hover:border-blue-500/50 cursor-pointer transform hover:scale-105 border border-amber-500/20 gaming-card"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <ArrowRightLeft className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-blue-300 mb-1">Гүйлгээ</h3>
              <p className="text-xs text-blue-400">Тоглогч руу шилжүүлэх</p>
            </button>

            {/* Цэнэглэх */}
            <button
              onClick={() => setShowDepositModal(true)}
              className="p-6 text-center rounded-2xl transition-all duration-300 hover:bg-green-500/20 hover:border-green-500/50 cursor-pointer transform hover:scale-105 border border-amber-500/20 gaming-card"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <ArrowUpCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-green-300 mb-1">Цэнэглэх</h3>
              <p className="text-xs text-green-400">Банкнаас цэнэглэх</p>
            </button>

            {/* Татах */}
            <button
              onClick={() => {
                if (totalWinnings <= 0) {
                  showError(
                    "Хангалтгүй үлдэгдэл",
                    "Татах мөнгө байхгүй байна!",
                    <CreditCard className="h-8 w-8 text-white" />,
                  )
                  return
                }
                setShowWithdrawModal(true)
              }}
              className="p-6 text-center rounded-2xl transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/50 cursor-pointer transform hover:scale-105 border border-amber-500/20 gaming-card"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <ArrowDownCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-red-300 mb-1">Татах</h3>
              <p className="text-xs text-red-400">Банк руу шилжүүлэх</p>
            </button>
          </div>

          {/* Modals */}
          <TransferModal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            maxAmount={totalWinnings}
            onTransfer={handleTransfer}
            onLookupAccount={handleLookupAccount}
          />

          <DepositModal
            isOpen={showDepositModal}
            onClose={() => setShowDepositModal(false)}
            onDeposit={handleDeposit}
            internalAccount={internalAccount}
          />

          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            maxAmount={totalWinnings}
            onWithdraw={handleWithdraw}
            internalAccount={internalAccount}
          />

          <TransactionHistoryModal
            isOpen={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            userProfile={userProfile}
          />
        </>
      )}

      {/* Custom Alert Component */}
      <AlertComponent />
    </div>
  )
}
