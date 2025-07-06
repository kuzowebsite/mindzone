"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowUpCircle, Building, DollarSign, CreditCard } from "lucide-react"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDeposit: (amount: number, bankName: string, accountNumber: string, accountHolderName: string) => void
  internalAccount: {
    accountNumber: string
    displayName: string
  }
}

export function DepositModal({ isOpen, onClose, onDeposit, internalAccount }: DepositModalProps) {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const depositAmount = Number(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      alert("Буруу мөнгөн дүн!")
      return
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
      alert("Бүх талбарыг бөглөнө үү!")
      return
    }

    setLoading(true)
    try {
      await onDeposit(depositAmount, bankName.trim(), accountNumber.trim(), accountHolderName.trim())
      // Reset form
      setAmount("")
      setBankName("")
      setAccountNumber("")
      setAccountHolderName("")
      onClose()
    } catch (error) {
      console.error("Deposit error:", error)
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
          <DialogTitle className="text-xl font-bold text-green-300 flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5" />
            Мөнгө цэнэглэх
          </DialogTitle>
          <DialogDescription className="text-green-400">Банкны данснаас сайт руу мөнгө шилжүүлэх</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-1">
          {/* Recipient Info */}
          <div className="gaming-card p-4 rounded-lg border border-green-500/30 mb-4">
            <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Хүлээн авагч (Сайтын данс)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-200">Дансны дугаар:</span>
                <span className="text-green-300 font-mono font-bold">{internalAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200">Эзэмшигч:</span>
                <span className="text-green-300 font-semibold">{internalAccount.displayName}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-amber-300 flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Цэнэглэх дүн
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Мөнгөн дүн"
                min="1000"
                required
                className="gaming-card border-amber-500/30 text-white h-12"
              />
            </div>

            <div className="border-t border-amber-500/20 pt-4">
              <h3 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Таны банкны мэдээлэл
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

            <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
              <p className="text-blue-300 text-xs">
                💡 Анхаар: Таны банкны данснаас дээрх сайтын данс руу мөнгө шилжүүлсний дараа энэ хүсэлтийг илгээнэ үү.
                Админ шалгаж баталгаажуулсны дараа таны дансанд цэнэглэгдэнэ.
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
                className="flex-1 h-12 font-bold bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Илгээж байна...
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="mr-2 h-4 w-4" />
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
