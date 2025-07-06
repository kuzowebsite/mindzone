"use client"

import { useState, useEffect } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { ref, set, get, update, push } from "firebase/database"
import { auth, database } from "@/lib/firebase"
import type { UserProfile, InternalAccount, Transaction } from "@/lib/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If Firebase is not initialized, set loading to false and return
    if (!auth || !database) {
      console.warn("Firebase not initialized, using mock data")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user)

        if (user) {
          // Get user profile from database
          const profileRef = ref(database, `users/${user.uid}`)
          const snapshot = await get(profileRef)
          if (snapshot.exists()) {
            const profile = snapshot.val()
            // Ensure gameWinnings field exists for existing users
            if (profile.gameWinnings === undefined) {
              profile.gameWinnings = 0
            }
            setUserProfile(profile)
          }
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        setError("Authentication error occurred")
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const generatePlayerId = async (): Promise<number> => {
    if (!database) {
      // Return a random ID for demo purposes
      return Math.floor(100000 + Math.random() * 900000)
    }

    try {
      // Get the current counter from database
      const counterRef = ref(database, "playerIdCounter")
      const snapshot = await get(counterRef)

      let nextId = 100001 // Start from 100001
      if (snapshot.exists()) {
        nextId = snapshot.val() + 1
      }

      // Update the counter
      await set(counterRef, nextId)
      return nextId
    } catch (error) {
      console.error("Error generating player ID:", error)
      // Return a random ID as fallback
      return Math.floor(100000 + Math.random() * 900000)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase системд холбогдох боломжгүй байна")
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Update last login time
      if (database && result.user) {
        try {
          const lastLoginRef = ref(database, `users/${result.user.uid}/lastLoginAt`)
          await set(lastLoginRef, Date.now())
        } catch (loginUpdateError) {
          console.warn("Could not update last login time:", loginUpdateError)
          // Don't throw error for this, just log it
        }
      }

      return result
    } catch (error: any) {
      console.error("Sign in error:", error)

      // Re-throw with more specific error messages
      if (error.code === "auth/invalid-credential") {
        throw new Error("И-мэйл хаяг эсвэл нууц үг буруу байна")
      } else if (error.code === "auth/user-not-found") {
        throw new Error("Энэ и-мэйл хаягаар бүртгүүлсэн хэрэглэгч олдсонгүй")
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Нууц үг буруу байна")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("И-мэйл хаягийн формат буруу байна")
      } else if (error.code === "auth/user-disabled") {
        throw new Error("Энэ бүртгэл түр хаагдсан байна")
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Хэт олон удаа буруу оролдлого хийсэн байна. Түр хүлээгээд дахин оролдоно уу")
      } else if (error.code === "auth/network-request-failed") {
        throw new Error("Интернэт холболтын алдаа. Холболтоо шалгаад дахин оролдоно уу")
      } else {
        throw new Error(error.message || "Нэвтрэх үед тодорхойгүй алдаа гарлаа")
      }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: "player" | "organizer" = "player",
  ) => {
    if (!auth || !database) {
      throw new Error("Firebase not initialized")
    }

    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })

    // Generate unique player ID
    const playerId = await generatePlayerId()

    // Create comprehensive user profile in database (NO automatic internal account)
    const userProfile: UserProfile = {
      uid: result.user.uid,
      playerId,
      displayName,
      email,
      role,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      gamesPlayed: 0,
      totalWinnings: 0,
      gameWinnings: 0,
      highestScore: 0,
      isActive: true,
      // No internalAccount - users must create it themselves
    }

    // Store profile in database
    try {
      const profileRef = ref(database, `users/${result.user.uid}`)
      await set(profileRef, userProfile)

      // Also store in a separate players index for easy lookup by playerId
      const playerIndexRef = ref(database, `playerIndex/${playerId}`)
      await set(playerIndexRef, {
        uid: result.user.uid,
        displayName,
        playerId,
        role,
        createdAt: Date.now(),
      })

      setUserProfile(userProfile)
    } catch (error) {
      console.error("Error storing user profile:", error)
    }

    console.log("User profile created and stored:", userProfile)
    return result
  }

  const logout = () => {
    if (!auth) {
      return Promise.resolve()
    }
    return signOut(auth)
  }

  // Add function to update profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile || !database) return

    try {
      const updatedProfile = { ...userProfile, ...updates }
      const profileRef = ref(database, `users/${user.uid}`)
      await set(profileRef, updatedProfile)
      setUserProfile(updatedProfile)
    } catch (error) {
      console.error("Error updating user profile:", error)
    }
  }

  // Add function to update game winnings (separate from total winnings)
  const updateGameWinnings = async (amount: number) => {
    if (!user || !userProfile || !database) return

    try {
      const currentGameWinnings = userProfile.gameWinnings || 0
      const currentTotalWinnings = userProfile.totalWinnings || 0

      const updates = {
        gameWinnings: currentGameWinnings + amount,
        totalWinnings: currentTotalWinnings + amount,
      }

      await updateUserProfile(updates)
    } catch (error) {
      console.error("Error updating game winnings:", error)
      throw error
    }
  }

  // Function to create internal account (one-time only, user-initiated)
  const createInternalAccount = async (accountNumber: string) => {
    if (!user || !userProfile || !database) {
      throw new Error("Firebase not initialized or user not logged in.")
    }

    // Check if user already has an internal account
    if (userProfile.internalAccount) {
      throw new Error("Та аль хэдийн данстай байна. Данс нэг удаа л үүсгэх боломжтой.")
    }

    // Validate account number format (8 digits)
    if (!/^\d{8}$/.test(accountNumber)) {
      throw new Error("Дансны дугаар 8 оронтой тоо байх ёстой.")
    }

    try {
      // Check if account number already exists
      const accountsRef = ref(database, "internalAccounts")
      const snapshot = await get(accountsRef)

      if (snapshot.exists() && snapshot.val()[accountNumber]) {
        throw new Error("Энэ дансны дугаар аль хэдийн ашиглагдаж байна. Өөр дугаар сонгоно уу.")
      }

      // Create internal account with user's display name (can be changed up to 2 times)
      const internalAccount: InternalAccount = {
        accountNumber,
        displayName: userProfile.displayName,
        createdAt: Date.now(),
        changeCount: 0, // Can be changed up to 2 times
      }

      // Update user profile
      await updateUserProfile({ internalAccount })

      // Store in global registry
      const accountRef = ref(database, `internalAccounts/${accountNumber}`)
      await set(accountRef, {
        uid: user.uid,
        playerId: userProfile.playerId,
        displayName: userProfile.displayName,
        createdAt: Date.now(),
      })

      return {
        success: true,
        message: "Данс амжилттай үүсгэгдлээ!",
      }
    } catch (error) {
      console.error("Error creating internal account:", error)
      throw error
    }
  }

  // Add function to update internal account display name (up to 2 times)
  const updateInternalAccount = async (newDisplayName: string) => {
    if (!user || !userProfile || !userProfile.internalAccount || !database) {
      throw new Error("Та нэвтэрч орж дансаа үүсгэх хэрэгтэй.")
    }

    try {
      const currentAccount = userProfile.internalAccount

      // Check if user has reached change limit
      if (currentAccount.changeCount >= 2) {
        throw new Error("Та дансны нэрээ 2 удаа өөрчилсөн байна. Дахин өөрчлөх боломжгүй.")
      }

      // Validate new display name
      if (!newDisplayName.trim()) {
        throw new Error("Дансны нэр хоосон байж болохгүй.")
      }

      if (newDisplayName.trim().length < 2) {
        throw new Error("Дансны нэр хамгийн багадаа 2 тэмдэгт байх ёстой.")
      }

      if (newDisplayName.trim().length > 20) {
        throw new Error("Дансны нэр хамгийн ихдээ 20 тэмдэгт байх ёстой.")
      }

      // Check if new name is unique among all internal accounts
      const accountsRef = ref(database, "internalAccounts")
      const snapshot = await get(accountsRef)

      if (snapshot.exists()) {
        const accounts = snapshot.val()
        for (const accountNumber in accounts) {
          if (
            accountNumber !== currentAccount.accountNumber &&
            accounts[accountNumber].displayName.toLowerCase() === newDisplayName.trim().toLowerCase()
          ) {
            throw new Error("Энэ дансны нэр аль хэдийн ашиглагдаж байна. Өөр нэр сонгоно уу.")
          }
        }
      }

      // Update internal account
      const updatedAccount: InternalAccount = {
        ...currentAccount,
        displayName: newDisplayName.trim(),
        changeCount: currentAccount.changeCount + 1,
        lastChangedAt: Date.now(),
      }

      // Update in user profile
      await updateUserProfile({ internalAccount: updatedAccount })

      // Update in global registry
      const accountRef = ref(database, `internalAccounts/${currentAccount.accountNumber}`)
      await update(accountRef, {
        displayName: newDisplayName.trim(),
        lastChangedAt: Date.now(),
      })

      return {
        success: true,
        message: `Дансны нэр амжилттай өөрчлөгдлөө! (${2 - updatedAccount.changeCount} удаа өөрчлөх боломжтой)`,
        remainingChanges: 2 - updatedAccount.changeCount,
      }
    } catch (error) {
      console.error("Error updating internal account:", error)
      throw error
    }
  }

  // Add function to get user by account number
  const getUserByAccountNumber = async (accountNumber: string) => {
    if (!database) {
      throw new Error("Firebase not initialized")
    }

    if (!/^\d{8}$/.test(accountNumber)) {
      throw new Error("Дансны дугаар 8 оронтой тоо байх ёстой.")
    }

    try {
      // Check if account exists
      const accountRef = ref(database, `internalAccounts/${accountNumber}`)
      const snapshot = await get(accountRef)

      if (!snapshot.exists()) {
        throw new Error("Дансны дугаар олдсонгүй.")
      }

      const accountData = snapshot.val()

      // Get full user profile
      const userRef = ref(database, `users/${accountData.uid}`)
      const userSnapshot = await get(userRef)

      if (!userSnapshot.exists()) {
        throw new Error("Хэрэглэгчийн мэдээлэл олдсонгүй.")
      }

      return userSnapshot.val() as UserProfile
    } catch (error) {
      console.error("Error getting user by account number:", error)
      throw error
    }
  }

  // Add function to transfer money between users (only affects totalWinnings, not gameWinnings)
  const transferMoney = async (toAccountNumber: string, amount: number, description: string) => {
    if (!user || !userProfile || !userProfile.internalAccount || !database) {
      throw new Error("Та нэвтэрч орж дансаа үүсгэх хэрэгтэй.")
    }

    if (amount <= 0) {
      throw new Error("Мөнгөн дүн 0-ээс их байх ёстой.")
    }

    if (amount > (userProfile.totalWinnings || 0)) {
      throw new Error("Таны үлдэгдэл хүрэлцэхгүй байна.")
    }

    if (toAccountNumber === userProfile.internalAccount.accountNumber) {
      throw new Error("Өөртөө мөнгө шилжүүлэх боломжгүй.")
    }

    try {
      // Get recipient user
      const recipientUser = await getUserByAccountNumber(toAccountNumber)

      if (!recipientUser.internalAccount) {
        throw new Error("Хүлээн авагчийн данс олдсонгүй.")
      }

      // Create transaction record
      const transaction: Omit<Transaction, "id"> = {
        fromPlayerId: userProfile.playerId.toString(),
        fromPlayerName: userProfile.displayName,
        fromPlayerUid: user.uid,
        toPlayerId: recipientUser.playerId.toString(),
        toPlayerName: recipientUser.displayName,
        toPlayerUid: recipientUser.uid,
        amount,
        description: description.trim() || "Гүйлгээ",
        timestamp: Date.now(),
      }

      // Save transaction
      const transactionsRef = ref(database, "transactions")
      await push(transactionsRef, transaction)

      // Update sender's total balance only (not game winnings)
      const senderRef = ref(database, `users/${user.uid}`)
      await update(senderRef, {
        totalWinnings: (userProfile.totalWinnings || 0) - amount,
      })

      // Update recipient's total balance only (not game winnings)
      const recipientRef = ref(database, `users/${recipientUser.uid}`)
      await update(recipientRef, {
        totalWinnings: (recipientUser.totalWinnings || 0) + amount,
      })

      // Update local state
      await updateUserProfile({
        totalWinnings: (userProfile.totalWinnings || 0) - amount,
      })

      return {
        success: true,
        recipientName: recipientUser.displayName,
        amount,
      }
    } catch (error) {
      console.error("Error transferring money:", error)
      throw error
    }
  }

  // Add function to update last login
  const updateLastLogin = async () => {
    if (!user || !database) return

    try {
      const lastLoginRef = ref(database, `users/${user.uid}/lastLoginAt`)
      await set(lastLoginRef, Date.now())
    } catch (error) {
      console.error("Error updating last login:", error)
    }
  }

  return {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    updateGameWinnings,
    createInternalAccount,
    updateInternalAccount,
    getUserByAccountNumber,
    transferMoney,
    updateLastLogin,
  }
}
