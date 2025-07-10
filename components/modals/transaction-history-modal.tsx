"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { database } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"
import {
  ArrowRightLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react"

interface TransactionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile
}

interface TransactionRecord {
  id: string
  type: "transfer" | "deposit" | "withdrawal"
  amount: number
  description: string
  timestamp: number
  status: "completed" | "pending" | "rejected"
  fromName?: string
  toName?: string
  bankName?: string
  accountNumber?: string
}

export function TransactionHistoryModal({ isOpen, onClose, userProfile }: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "transfer" | "deposit" | "withdrawal">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  useEffect(() => {
    if (isOpen && userProfile) {
      loadTransactionHistory()
    }
  }, [isOpen, userProfile])

  useEffect(() => {
    filterTransactions()
  }, [transactions, startDate, endDate, typeFilter, searchTerm])

  const loadTransactionHistory = async () => {
    if (!database || !userProfile) return

    setLoading(true)
    try {
      const { ref, get, query, orderByChild, equalTo } = await import("firebase/database")

      const allTransactions: TransactionRecord[] = []

      // Load transfers (both sent and received)
      const transfersRef = ref(database, "transactions")
      const transfersSnapshot = await get(transfersRef)

      if (transfersSnapshot.exists()) {
        const transfersData = transfersSnapshot.val()
        Object.entries(transfersData).forEach(([id, transfer]: [string, any]) => {
          if (transfer.fromPlayerUid === userProfile.uid || transfer.toPlayerUid === userProfile.uid) {
            allTransactions.push({
              id,
              type: "transfer",
              amount: transfer.amount,
              description: transfer.description || "Гүйлгээ",
              timestamp: transfer.timestamp,
              status: "completed",
              fromName: transfer.fromPlayerName,
              toName: transfer.toPlayerName,
            })
          }
        })
      }

      // Load deposit requests
      const depositsRef = ref(database, "depositRequests")
      const depositsSnapshot = await get(depositsRef)

      if (depositsSnapshot.exists()) {
        const depositsData = depositsSnapshot.val()
        Object.entries(depositsData).forEach(([id, deposit]: [string, any]) => {
          if (deposit.playerUid === userProfile.uid) {
            allTransactions.push({
              id,
              type: "deposit",
              amount: deposit.amount,
              description: "Цэнэглэх хүсэлт",
              timestamp: deposit.requestedAt,
              status: deposit.status,
              bankName: deposit.bankAccount?.bankName,
              accountNumber: deposit.bankAccount?.accountNumber,
            })
          }
        })
      }

      // Load withdrawal requests
      const withdrawalsRef = ref(database, "withdrawalRequests")
      const withdrawalsSnapshot = await get(withdrawalsRef)

      if (withdrawalsSnapshot.exists()) {
        const withdrawalsData = withdrawalsSnapshot.val()
        Object.entries(withdrawalsData).forEach(([id, withdrawal]: [string, any]) => {
          if (withdrawal.playerUid === userProfile.uid) {
            allTransactions.push({
              id,
              type: "withdrawal",
              amount: withdrawal.amount,
              description: "Татах хүсэлт",
              timestamp: withdrawal.requestedAt,
              status: withdrawal.status,
              bankName: withdrawal.bankAccount?.bankName,
              accountNumber: withdrawal.bankAccount?.accountNumber,
            })
          }
        })
      }

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp)
      setTransactions(allTransactions)
    } catch (error) {
      console.error("Error loading transaction history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Filter by date range
    if (startDate) {
      const startTime = new Date(startDate).getTime()
      filtered = filtered.filter((t) => t.timestamp >= startTime)
    }

    if (endDate) {
      const endTime = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1 // End of day
      filtered = filtered.filter((t) => t.timestamp <= endTime)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.fromName?.toLowerCase().includes(term) ||
          t.toName?.toLowerCase().includes(term) ||
          t.bankName?.toLowerCase().includes(term) ||
          t.accountNumber?.includes(term),
      )
    }

    setFilteredTransactions(filtered)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      case "deposit":
        return <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
      case "withdrawal":
        return <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5" />
      default:
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
      case "pending":
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
      case "rejected":
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
      default:
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Амжилттай"
      case "pending":
        return "Хүлээгдэж буй"
      case "rejected":
        return "Татгалзсан"
      default:
        return "Тодорхойгүй"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "transfer":
        return "Гүйлгээ"
      case "deposit":
        return "Цэнэглэх"
      case "withdrawal":
        return "Татах"
      default:
        return "Тодорхойгүй"
    }
  }

  const getAmountColor = (type: string, transaction: TransactionRecord) => {
    if (type === "transfer") {
      return transaction.fromName === userProfile.displayName ? "text-red-400" : "text-green-400"
    }
    return type === "deposit" ? "text-green-400" : "text-red-400"
  }

  const getAmountPrefix = (type: string, transaction: TransactionRecord) => {
    if (type === "transfer") {
      return transaction.fromName === userProfile.displayName ? "-" : "+"
    }
    return type === "deposit" ? "+" : "-"
  }

  const exportTransactions = () => {
    const csvContent = [
      ["Огноо", "Төрөл", "Дүн", "Тайлбар", "Төлөв"].join(","),
      ...filteredTransactions.map((t) =>
        [
          new Date(t.timestamp).toLocaleDateString("mn-MN"),
          getTypeText(t.type),
          `${getAmountPrefix(t.type, t)}${t.amount.toLocaleString()}₮`,
          t.description,
          getStatusText(t.status),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transaction-history-${Date.now()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearAllFilters = () => {
    setStartDate("")
    setEndDate("")
    setTypeFilter("all")
    setSearchTerm("")
  }

  const hasActiveFilters = startDate || endDate || typeFilter !== "all" || searchTerm

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gaming-card w-[95vw] max-w-6xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col p-0 sm:p-6">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 p-4 sm:p-0 pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-amber-300 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            </div>
            <span className="text-base sm:text-2xl">Гүйлгээний түүх</span>
          </DialogTitle>
        </DialogHeader>

        {/* Filter Toggle Button */}
        <div className="flex-shrink-0 px-4 sm:px-0">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              variant="outline"
              className="gaming-card border-amber-500/30 text-amber-300 hover:bg-amber-500/20 bg-transparent flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm sm:text-base">Шүүлтүүр</span>
              {filtersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {hasActiveFilters && <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>}
            </Button>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-amber-400">
                Нийт: <span className="font-bold text-white">{filteredTransactions.length}</span>
              </span>
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-white h-6 px-2"
                >
                  Цэвэрлэх
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        <div
          className={`flex-shrink-0 px-4 sm:px-0 transition-all duration-300 ease-in-out overflow-hidden ${
            filtersExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-amber-500/20">
            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-amber-300 block flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  Эхлэх огноо
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="gaming-card border-amber-500/30 text-white text-sm h-9 sm:h-10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-amber-300 block flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  Дуусах огноо
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="gaming-card border-amber-500/30 text-white text-sm h-9 sm:h-10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-amber-300 block flex items-center gap-2">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  Төрөл
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full h-9 sm:h-10 px-3 rounded-lg bg-gray-800 border border-amber-500/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                >
                  <option value="all">Бүгд</option>
                  <option value="transfer">Гүйлгээ</option>
                  <option value="deposit">Цэнэглэх</option>
                  <option value="withdrawal">Татах</option>
                </select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-amber-300 block flex items-center gap-2">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                  Хайх
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Тайлбар, нэр..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="gaming-card border-amber-500/30 text-white pl-10 text-sm h-9 sm:h-10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-gray-700">
              <div className="flex flex-wrap gap-2">
                {startDate && (
                  <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                    Эхлэх: {new Date(startDate).toLocaleDateString("mn-MN")}
                    <button onClick={() => setStartDate("")} className="ml-1 hover:text-white">
                      ×
                    </button>
                  </Badge>
                )}
                {endDate && (
                  <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                    Дуусах: {new Date(endDate).toLocaleDateString("mn-MN")}
                    <button onClick={() => setEndDate("")} className="ml-1 hover:text-white">
                      ×
                    </button>
                  </Badge>
                )}
                {typeFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {getTypeText(typeFilter)}
                    <button onClick={() => setTypeFilter("all")} className="ml-1 hover:text-white">
                      ×
                    </button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-white">
                      ×
                    </button>
                  </Badge>
                )}
              </div>

              <Button
                onClick={exportTransactions}
                variant="outline"
                size="sm"
                className="gaming-card border-green-500/30 text-green-300 hover:bg-green-500/20 bg-transparent text-xs sm:text-sm"
                disabled={filteredTransactions.length === 0}
              >
                <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Татаж авах
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          <div className="space-y-2 sm:space-y-3 py-2 sm:py-4">
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-amber-400 border-t-transparent mx-auto mb-4"></div>
                <p className="text-amber-300 text-sm sm:text-base">Түүх ачааллаж байна...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-sm sm:text-base">
                  {hasActiveFilters ? "Шүүлтүүрт тохирох гүйлгээ олдсонгүй" : "Гүйлгээний түүх олдсонгүй"}
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="mt-4 gaming-card border-amber-500/30 text-amber-300 hover:bg-amber-500/20 bg-transparent"
                  >
                    Шүүлтүүр цэвэрлэх
                  </Button>
                )}
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className="gaming-card border-amber-500/20 hover:border-amber-500/40 transition-colors"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      {/* Left Side */}
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className="font-medium text-white text-sm sm:text-base truncate">
                              {getTypeText(transaction.type)}
                            </h3>
                            <Badge variant="outline" className="text-xs w-fit">
                              <span className="flex items-center gap-1">
                                {getStatusIcon(transaction.status)}
                                <span className="hidden sm:inline">{getStatusText(transaction.status)}</span>
                              </span>
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">{transaction.description}</p>
                          {transaction.type === "transfer" && (
                            <p className="text-xs text-gray-500 truncate">
                              {transaction.fromName === userProfile.displayName
                                ? `→ ${transaction.toName}`
                                : `← ${transaction.fromName}`}
                            </p>
                          )}
                          {(transaction.type === "deposit" || transaction.type === "withdrawal") &&
                            transaction.bankName && (
                              <p className="text-xs text-gray-500 truncate">
                                {transaction.bankName}
                                {transaction.accountNumber && ` - ${transaction.accountNumber}`}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm sm:text-lg font-bold ${getAmountColor(transaction.type, transaction)}`}>
                          {getAmountPrefix(transaction.type, transaction)}
                          {transaction.amount.toLocaleString()}₮
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(transaction.timestamp).toLocaleDateString("mn-MN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 p-4 sm:p-0 pt-4 border-t border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="gaming-card border-gray-500 text-gray-300 bg-transparent text-sm sm:text-base"
          >
            Хаах
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
