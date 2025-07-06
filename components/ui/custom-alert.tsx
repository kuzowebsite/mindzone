"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

interface AlertState {
  isOpen: boolean
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  icon?: React.ReactNode
}

export function useCustomAlert() {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  })

  const showAlert = useCallback((type: AlertState["type"], title: string, message: string, icon?: React.ReactNode) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      icon,
    })
  }, [])

  const showSuccess = useCallback(
    (title: string, message: string) => {
      showAlert("success", title, message, <CheckCircle className="h-8 w-8 text-green-400" />)
    },
    [showAlert],
  )

  const showError = useCallback(
    (title: string, message: string) => {
      showAlert("error", title, message, <AlertCircle className="h-8 w-8 text-red-400" />)
    },
    [showAlert],
  )

  const showWarning = useCallback(
    (title: string, message: string) => {
      showAlert("warning", title, message, <AlertTriangle className="h-8 w-8 text-yellow-400" />)
    },
    [showAlert],
  )

  const showInfo = useCallback(
    (title: string, message: string) => {
      showAlert("info", title, message, <Info className="h-8 w-8 text-blue-400" />)
    },
    [showAlert],
  )

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const getBackgroundColor = () => {
    switch (alert.type) {
      case "success":
        return "bg-gradient-to-br from-green-900/90 to-green-800/90"
      case "error":
        return "bg-gradient-to-br from-red-900/90 to-red-800/90"
      case "warning":
        return "bg-gradient-to-br from-yellow-900/90 to-yellow-800/90"
      case "info":
        return "bg-gradient-to-br from-blue-900/90 to-blue-800/90"
      default:
        return "bg-gradient-to-br from-gray-900/90 to-gray-800/90"
    }
  }

  const getBorderColor = () => {
    switch (alert.type) {
      case "success":
        return "border-green-500/30"
      case "error":
        return "border-red-500/30"
      case "warning":
        return "border-yellow-500/30"
      case "info":
        return "border-blue-500/30"
      default:
        return "border-gray-500/30"
    }
  }

  const AlertComponent = () => (
    <Dialog open={alert.isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent
        className={`
          ${getBackgroundColor()} 
          ${getBorderColor()} 
          border-2 rounded-2xl p-6 max-w-sm mx-auto
          backdrop-blur-sm shadow-2xl
        `}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Close button */}
          <button
            onClick={hideAlert}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/20 border border-white/10">
            {alert.icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white">{alert.title}</h3>

          {/* Message */}
          <p className="text-gray-200 text-sm leading-relaxed">{alert.message}</p>

          {/* Button */}
          <Button
            onClick={hideAlert}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Ойлголоо
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
    AlertComponent,
  }
}
