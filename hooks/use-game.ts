"use client"

import { useState, useEffect } from "react"
import { ref, onValue, push, set, update } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Game, Player, Challenge, GameVotes, ChallengeSubmission } from "@/lib/types"

export function useGame(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null)
  const [votes, setVotes] = useState<GameVotes | null>(null)
  const [loading, setLoading] = useState(true)
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    // Always listen to all games for the lobby
    const gamesRef = ref(database, "games")
    const unsubscribeAllGames = onValue(gamesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const gamesList = Object.values(data) as Game[]
        const scheduledGames = gamesList.filter((game) => game.status === "scheduled" || game.status === "waiting")
        setGames(scheduledGames)
      } else {
        setGames([])
      }
    })

    // Only listen to specific game if gameId is provided
    if (gameId) {
      const gameRef = ref(database, `games/${gameId}`)
      const votesRef = ref(database, `games/${gameId}/votes`)

      const unsubscribeGame = onValue(gameRef, (snapshot) => {
        const data = snapshot.val()
        setGame(data)
        setLoading(false)
      })

      const unsubscribeVotes = onValue(votesRef, (snapshot) => {
        const data = snapshot.val()
        setVotes(data || { continue: {}, end: {} })
      })

      return () => {
        unsubscribeGame()
        unsubscribeVotes()
        unsubscribeAllGames()
      }
    } else {
      setLoading(false)
      return () => {
        unsubscribeAllGames()
      }
    }
  }, [gameId])

  const createGame = async (
    hostId: string,
    ticketPrice = 10,
    scheduledStartTime: number,
    joinOpenTime: number,
    ticketPurchaseDeadline: number,
    gameType: "classic" | "individual" = "classic",
  ) => {
    const gamesRef = ref(database, "games")
    const newGameRef = push(gamesRef)
    const gameId = newGameRef.key!

    const newGame: Game = {
      id: gameId,
      hostId,
      status: "scheduled",
      gameType,
      players: {},
      prizePool: 0,
      ticketPrice,
      minPlayers: 8,
      scheduledStartTime,
      joinOpenTime,
      ticketPurchaseDeadline,
      createdAt: Date.now(),
      currentRound: 0,
    }

    await set(newGameRef, newGame)
    return gameId
  }

  const joinGame = async (gameId: string, player: Player) => {
    const playerRef = ref(database, `games/${gameId}/players/${player.uid}`)
    const prizePoolRef = ref(database, `games/${gameId}/prizePool`)
    const statusRef = ref(database, `games/${gameId}/status`)

    await set(playerRef, player)

    // Get current game data to update prize pool
    const gameRef = ref(database, `games/${gameId}`)
    const snapshot = await new Promise<any>((resolve) => {
      onValue(gameRef, resolve, { onlyOnce: true })
    })

    const currentGame = snapshot.val() as Game
    if (currentGame) {
      await set(prizePoolRef, currentGame.prizePool + currentGame.ticketPrice)

      // Change status to waiting if it was scheduled
      if (currentGame.status === "scheduled") {
        await set(statusRef, "waiting")
      }
    }
  }

  const startGame = async (gameId: string) => {
    const statusRef = ref(database, `games/${gameId}/status`)
    await set(statusRef, "active")
  }

  const submitVote = async (gameId: string, playerId: string, choice: "continue" | "end") => {
    const voteRef = ref(database, `games/${gameId}/votes/${choice}/${playerId}`)
    await set(voteRef, {
      playerId,
      choice,
      timestamp: Date.now(),
    })
  }

  const getTimeLimit = (difficulty: "easy" | "medium" | "hard"): number => {
    switch (difficulty) {
      case "easy":
        return Math.floor(Math.random() * 31) + 30 // 30-60 seconds (30s to 1min)
      case "medium":
        return Math.floor(Math.random() * 61) + 60 // 60-120 seconds (1-2min)
      case "hard":
        return Math.floor(Math.random() * 61) + 120 // 120-180 seconds (2-3min)
      default:
        return 60
    }
  }

  const createChallenge = async (gameId: string, challenge: Omit<Challenge, "id" | "createdAt" | "timeLimit">) => {
    const timeLimit = getTimeLimit(challenge.difficulty)

    const challengeRef = ref(database, `games/${gameId}/currentChallenge`)
    const newChallenge: Challenge = {
      ...challenge,
      id: Date.now().toString(),
      createdAt: Date.now(),
      timeLimit,
    }
    await set(challengeRef, newChallenge)

    // Clear previous submissions
    const submissionsRef = ref(database, `games/${gameId}/challengeSubmissions`)
    await set(submissionsRef, {})

    // Clear previous votes
    const votesRef = ref(database, `games/${gameId}/votes`)
    await set(votesRef, { continue: {}, end: {} })
  }

  const submitChallengeAnswer = async (
    gameId: string,
    playerId: string,
    answer: string,
    isCorrect = false,
    score = 0,
  ) => {
    const submission: ChallengeSubmission = {
      playerId,
      answer,
      submittedAt: Date.now(),
      isCorrect,
      score,
    }

    const submissionRef = ref(database, `games/${gameId}/challengeSubmissions/${playerId}`)
    await set(submissionRef, submission)

    // Update player's total score
    const playerScoreRef = ref(database, `games/${gameId}/players/${playerId}/score`)
    const gameRef = ref(database, `games/${gameId}`)
    const snapshot = await new Promise<any>((resolve) => {
      onValue(gameRef, resolve, { onlyOnce: true })
    })

    const currentGame = snapshot.val() as Game
    if (currentGame && currentGame.players[playerId]) {
      const newTotalScore = currentGame.players[playerId].score + score
      await set(playerScoreRef, newTotalScore)
    }
  }

  const updatePlayerScore = async (gameId: string, playerId: string, score: number) => {
    const scoreRef = ref(database, `games/${gameId}/players/${playerId}/score`)
    await set(scoreRef, score)
  }

  const eliminatePlayer = async (gameId: string, playerId: string) => {
    const eliminatedRef = ref(database, `games/${gameId}/players/${playerId}/isEliminated`)
    await set(eliminatedRef, true)
  }

  const eliminatePlayerByNewRules = async (gameId: string) => {
    if (!game?.challengeSubmissions) return

    const submissions = Object.values(game.challengeSubmissions)
    if (submissions.length === 0) return

    // Separate correct and incorrect submissions
    const incorrectSubmissions = submissions.filter((s) => !s.isCorrect)
    const correctSubmissions = submissions.filter((s) => s.isCorrect)

    let playerToEliminate: string | null = null

    if (incorrectSubmissions.length > 0) {
      // If there are incorrect submissions, eliminate the first one who answered incorrectly
      const firstIncorrect = incorrectSubmissions.reduce((earliest, current) =>
        current.submittedAt < earliest.submittedAt ? current : earliest,
      )
      playerToEliminate = firstIncorrect.playerId
    } else if (correctSubmissions.length > 0) {
      // If all submissions are correct, eliminate the last one who submitted
      const lastCorrect = correctSubmissions.reduce((latest, current) =>
        current.submittedAt > latest.submittedAt ? current : latest,
      )
      playerToEliminate = lastCorrect.playerId
    }

    if (playerToEliminate) {
      await eliminatePlayer(gameId, playerToEliminate)

      // After elimination, check if game should continue
      const gameRef = ref(database, `games/${gameId}`)
      const snapshot = await new Promise<any>((resolve) => {
        onValue(gameRef, resolve, { onlyOnce: true })
      })

      const updatedGame = snapshot.val() as Game
      const remainingPlayers = Object.values(updatedGame.players).filter((p) => !p.isEliminated)

      if (remainingPlayers.length <= 1) {
        // Game ends, declare winner
        if (remainingPlayers.length === 1) {
          await endGame(gameId, remainingPlayers[0].uid)
        } else {
          await endGame(gameId)
        }
      } else {
        // Check game type to determine next phase
        if (updatedGame.gameType === "individual") {
          // For individual games, go to individual decision phase
          const statusRef = ref(database, `games/${gameId}/status`)
          await set(statusRef, "individual_decision")
        } else {
          // For classic games, start voting phase
          const statusRef = ref(database, `games/${gameId}/status`)
          await set(statusRef, "voting")
        }
      }
    }
  }

  const finishChallenge = async (gameId: string) => {
    // This function is called when challenge time ends or all players submit
    await eliminatePlayerByNewRules(gameId)
  }

  const endGame = async (gameId: string, winnerId?: string) => {
    const updates: Record<string, any> = {
      [`games/${gameId}/status`]: "ended",
    }

    if (winnerId) {
      updates[`games/${gameId}/winnerId`] = winnerId
    }

    await update(ref(database), updates)
  }

  const processVoteResults = async (gameId: string) => {
    if (!votes) return

    const continueVotes = Object.keys(votes.continue).length
    const endVotes = Object.keys(votes.end).length

    if (continueVotes > endVotes) {
      // Continue game - create next challenge
      const gameRef = ref(database, `games/${gameId}`)
      const snapshot = await new Promise<any>((resolve) => {
        onValue(gameRef, resolve, { onlyOnce: true })
      })

      const currentGame = snapshot.val() as Game
      const nextRound = (currentGame.currentRound || 0) + 1

      // Update round number
      const roundRef = ref(database, `games/${gameId}/currentRound`)
      await set(roundRef, nextRound)

      // Set status back to active for next challenge
      const statusRef = ref(database, `games/${gameId}/status`)
      await set(statusRef, "active")

      // Create next challenge (this should be called from game-room component)
    } else {
      // End game - split prize
      await endGame(gameId)
    }
  }

  return {
    game,
    votes,
    loading,
    games,
    createGame,
    joinGame,
    startGame,
    submitVote,
    createChallenge,
    submitChallengeAnswer,
    updatePlayerScore,
    eliminatePlayer,
    eliminatePlayerByNewRules,
    finishChallenge,
    processVoteResults,
    endGame,
  }
}
