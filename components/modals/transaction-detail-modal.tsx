"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRightLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building2,
  CreditCard,
  Calendar,
  Hash,
  FileText,
  Copy,
} from "lucide-react"

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

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: TransactionRecord | null
  currentUserName: string
}

export function TransactionDetailModal({ isOpen, onClose, transaction, currentUserName }: TransactionDetailModalProps) {
  if (!transaction) return null

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <ArrowRightLeft className="h-6 w-6" />
      case "deposit":
        return <ArrowUpCircle className="h-6 w-6" />
      case "withdrawal":
        return <ArrowDownCircle className="h-6 w-6" />
      default:
        return <Clock className="h-6 w-6" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
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

  const getAmountColor = (type: string) => {
    if (type === "transfer") {
      return transaction.fromName === currentUserName ? "text-red-400" : "text-green-400"
    }
    return type === "deposit" ? "text-green-400" : "text-red-400"
  }

  const getAmountPrefix = (type: string) => {
    if (type === "transfer") {
      return transaction.fromName === currentUserName ? "-" : "+"
    }
    return type === "deposit" ? "+" : "-"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "long",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gaming-card w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-amber-300 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <div className="text-xl">{getTypeText(transaction.type)}</div>
              <div className="text-sm font-normal text-gray-400">Гүйлгээний дэлгэрэнгүй</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount and Status */}
          <Card className="gaming-card border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Дүн</p>
                  <p className={`text-3xl font-bold ${getAmountColor(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)}
                    {transaction.amount.toLocaleString()}₮
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-2">Төлөв</p>
                  <Badge className={`${getStatusColor(transaction.status)} text-sm px-3 py-1`}>
                    <span className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      {getStatusText(transaction.status)}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card className="gaming-card border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Гүйлгээний мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Transaction ID */}
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Гүйлгээний ID</p>
                    <p className="text-white font-mono text-sm">{transaction.id}</p>
                  </div>
                </div>
                <Button
                  onClick={() => copyToClipboard(transaction.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Date and Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Огноо, цаг</p>
                  <p className="text-white">{formatDateTime(transaction.timestamp)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Тайлбар</p>
                  <p className="text-white">{transaction.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Details */}
          {transaction.type === "transfer" && (
            <Card className="gaming-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Гүйлгээний талууд
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* From */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <User className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-400">Илгээгч</p>
                    <p className="text-white font-medium">{transaction.fromName}</p>
                    {transaction.fromName === currentUserName && (
                      <Badge variant="outline" className="text-xs mt-1 border-amber-500/30 text-amber-300">
                        Та
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRightLeft className="h-6 w-6 text-amber-400" />
                </div>

                {/* To */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <User className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Хүлээн авагч</p>
                    <p className="text-white font-medium">{transaction.toName}</p>
                    {transaction.toName === currentUserName && (
                      <Badge variant="outline" className="text-xs mt-1 border-amber-500/30 text-amber-300">
                        Та
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {(transaction.type === "deposit" || transaction.type === "withdrawal") && transaction.bankName && (
            <Card className="gaming-card border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Банкны мэдээлэл
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bank Name */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Банкны нэр</p>
                    <p className="text-white font-medium">{transaction.bankName}</p>
                  </div>
                </div>

                {/* Account Number */}
                {transaction.accountNumber && (
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Дансны дугаар</p>
                        <p className="text-white font-mono">{transaction.accountNumber}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(transaction.accountNumber!)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          <Card className="gaming-card border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-amber-300 flex items-center gap-2">
                {getStatusIcon(transaction.status)}
                Төлөвийн мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transaction.status === "completed" && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-300 font-medium">Амжилттай гүйцэтгэгдсэн</span>
                    </div>
                    <p className="text-sm text-green-200">Гүйлгээ амжилттай хийгдэж, таны дансанд тусгагдсан байна.</p>
                  </div>
                )}

                {transaction.status === "pending" && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Хүлээгдэж байна</span>
                    </div>
                    <p className="text-sm text-yellow-200">Гүйлгээ хянагдаж байгаа бөгөөд удахгүй баталгаажих болно.</p>
                  </div>
                )}

                {transaction.status === "rejected" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="text-red-300 font-medium">Татгалзсан</span>
                    </div>
                    <p className="text-sm text-red-200">
                      Гүйлгээ татгалзагдсан байна. Дэлгэрэнгүй мэдээлэл авахыг хүсвэл холбогдоно уу.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="gaming-card border-gray-500 text-gray-300 bg-transparent"
          >
            Хаах
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
