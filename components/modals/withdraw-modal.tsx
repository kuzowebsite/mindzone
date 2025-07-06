"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowDownCircle, Building, DollarSign, Wallet } from "lucide-react"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  maxAmount: number
  onWithdraw: (amount: number, bankName: string, accountNumber: string, accountHolderName: string) => void
  internalAccount: {
    accountNumber: string
    displayName: string
  }
}

export function WithdrawModal({ isOpen, onClose, maxAmount, onWithdraw, internalAccount }: WithdrawModalProps) {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = Number(amount)
    if (isNaN(withdrawAmount) || withdrawAmount < 5000) {
      alert("Хамгийн багадаа 5,000₮ татах боломжтой!")
      return
    }

    if (withdrawAmount > maxAmount) {
      alert("Таны үлдэгдэл хүрэлцэхгүй байна!")
      return
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
      alert("Бүх талбарыг бөглөнө үү!")
      return
    }

    setLoading(true)
    try {
      await onWithdraw(withdrawAmount, bankName.trim(), accountNumber.trim(), accountHolderName.trim())
      // Reset form
      setAmount("")
      setBankName("")
      setAccountNumber("")
      setAccountHolderName("")
      onClose()
    } catch (error) {
      console.error("Withdraw error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAmount("")
    setBankName("")
    setAccountNumber("")
    setAccountHolderName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="gaming-card border-amber-500/30 w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-300 flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5" />
            Мөнгө татах
          </DialogTitle>
          <DialogDescription className="text-red-400">Сайтын данснаас банк руу мөнгө шилжүүлэх</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-1">
          {/* Source Info */}
          <div className="gaming-card p-4 rounded-lg border border-red-500/30 mb-4">
            <h3 className="text-red-300 font-semibold mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Татах данс (Таны сайтын данс)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-200">Дансны дугаар:</span>
                <span className="text-red-300 font-mono font-bold">{internalAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">Эзэмшигч:</span>
                <span className="text-red-300 font-semibold">{internalAccount.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">Боломжтой дүн:</span>
                <span className="text-green-300 font-bold">{maxAmount.toLocaleString()}₮</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-amber-300 flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Татах дүн
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Мөнгөн дүн"
                min="5000"
                max={maxAmount}
                required
                className="gaming-card border-amber-500/30 text-white h-12"
              />
              <p className="text-xs text-amber-400 mt-1">
                Хамгийн бага: 5,000₮ | Дээд хязгаар: {maxAmount.toLocaleString()}₮
              </p>
            </div>

            <div className="border-t border-amber-500/20 pt-4">
              <h3 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Хүлээн авах банкны мэдээлэл
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bankName" className="text-amber-300 mb-2 block">
                    Банкны нэр
                  </Label>
                  <Input
                    id="bankName"
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Жишээ: Хаан банк"
                    required
                    className="gaming-card border-amber-500/30 text-white h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber" className="text-amber-300 mb-2 block">
                    Дансны дугаар
                  </Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Таны банкны дансны дугаар"
                    required
                    className="gaming-card border-amber-500/30 text-white h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="accountHolderName" className="text-amber-300 mb-2 block">
                    Данс эзэмшигчийн нэр
                  </Label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Дансны эзэмшигчийн нэр"
                    required
                    className="gaming-card border-amber-500/30 text-white h-12"
                  />
                </div>
              </div>
            </div>

            <div className="bg-orange-500/10 p-3 rounded border border-orange-500/20">
              <p className="text-orange-300 text-xs">
                ⚡ Мэдээлэл: Админ таны хүсэлтийг шалгаж баталгаажуулсны дараа 2 минутын дотор таны банкны данс руу
                мөнгө шилжүүлэгдэнэ.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12 gaming-card border-gray-500/30 text-gray-300 hover:bg-gray-500/20 bg-transparent"
                disabled={loading}
              >
                Цуцлах
              </Button>
              <Button
                type="submit"
                disabled={loading || !amount || !bankName || !accountNumber || !accountHolderName}
                className="flex-1 h-12 font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Илгээж байна...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="mr-2 h-4 w-4" />
                    Хүсэлт илгээх
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
