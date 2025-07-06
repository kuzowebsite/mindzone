"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRightLeft, User, DollarSign, Check, AlertCircle, Loader2 } from "lucide-react"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  maxAmount: number
  onTransfer: (accountNumber: string, amount: number, description: string) => void
  onLookupAccount?: (accountNumber: string) => Promise<{ displayName: string } | null>
}

export function TransferModal({ isOpen, onClose, maxAmount, onTransfer, onLookupAccount }: TransferModalProps) {
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // Recipient lookup states
  const [recipientName, setRecipientName] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState("")
  const [lastLookedUpAccount, setLastLookedUpAccount] = useState("")

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Account lookup effect
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Reset states if account number is not 8 digits
    if (accountNumber.length !== 8) {
      setRecipientName("")
      setLookupError("")
      setLastLookedUpAccount("")
      setLookupLoading(false)
      return
    }

    // Don't lookup if we already looked up this account number
    if (accountNumber === lastLookedUpAccount && (recipientName || lookupError)) {
      return
    }

    // Don't lookup if no lookup function provided
    if (!onLookupAccount) {
      return
    }

    // Set loading state
    setLookupLoading(true)
    setLookupError("")
    setRecipientName("")

    // Debounced lookup
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await onLookupAccount(accountNumber)
        if (result) {
          setRecipientName(result.displayName)
          setLookupError("")
        } else {
          setRecipientName("")
          setLookupError("Данс олдсонгүй")
        }
        setLastLookedUpAccount(accountNumber)
      } catch (error: any) {
        setRecipientName("")
        setLookupError(error.message || "Данс хайхад алдаа гарлаа")
        setLastLookedUpAccount(accountNumber)
      } finally {
        setLookupLoading(false)
      }
    }, 500)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [accountNumber, onLookupAccount, lastLookedUpAccount, recipientName, lookupError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/^\d{8}$/.test(accountNumber)) {
      alert("Буруу дансны дугаар! 8 оронтой тоо оруулна уу.")
      return
    }

    const transferAmount = Number(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      alert("Буруу мөнгөн дүн!")
      return
    }

    if (transferAmount > maxAmount) {
      alert("Таны үлдэгдэл хүрэлцэхгүй байна!")
      return
    }

    if (!recipientName) {
      alert("Хүлээн авагчийн данс баталгаажуулаагүй байна!")
      return
    }

    setLoading(true)
    try {
      await onTransfer(accountNumber, transferAmount, description)
      // Reset form
      resetForm()
      onClose()
    } catch (error) {
      console.error("Transfer error:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAccountNumber("")
    setAmount("")
    setDescription("")
    setRecipientName("")
    setLookupError("")
    setLastLookedUpAccount("")
    setLookupLoading(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8)
    setAccountNumber(value)

    // If account number changed, reset lookup states
    if (value !== lastLookedUpAccount) {
      setRecipientName("")
      setLookupError("")
      setLastLookedUpAccount("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="gaming-card border-amber-500/30 w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Мөнгө шилжүүлэх
          </DialogTitle>
          <DialogDescription className="text-blue-400">Бусад тоглогч руу мөнгө шилжүүлэх</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accountNumber" className="text-amber-300 flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                Хүлээн авагчийн дансны дугаар
              </Label>
              <Input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={handleAccountNumberChange}
                placeholder="8 оронтой дансны дугаар"
                maxLength={8}
                required
                className="gaming-card border-amber-500/30 text-white h-12"
              />

              {/* Recipient name display */}
              <div className="mt-2 min-h-[24px]">
                {lookupLoading && accountNumber.length === 8 && (
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Данс хайж байна...
                  </div>
                )}
                {recipientName && !lookupLoading && (
                  <div className="text-green-400 text-sm flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-md border border-green-500/20">
                    <Check className="h-3 w-3" />
                    <span className="font-medium">Хүлээн авагч: {recipientName}</span>
                  </div>
                )}
                {lookupError && !lookupLoading && (
                  <div className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20">
                    <AlertCircle className="h-3 w-3" />
                    <span>{lookupError}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="amount" className="text-amber-300 flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Шилжүүлэх дүн
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Мөнгөн дүн"
                min="1"
                max={maxAmount}
                required
                className="gaming-card border-amber-500/30 text-white h-12"
              />
              <p className="text-xs text-amber-400 mt-1">Дээд хязгаар: {maxAmount.toLocaleString()}₮</p>
            </div>

            <div>
              <Label htmlFor="description" className="text-amber-300 mb-2 block">
                Гүйлгээний утга (заавал биш)
              </Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Гүйлгээний тайлбар"
                maxLength={100}
                className="gaming-card border-amber-500/30 text-white h-12"
              />
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
                disabled={loading || !accountNumber || !amount || !recipientName || lookupLoading}
                className="flex-1 h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Шилжүүлж байна...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Шилжүүлэх
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
