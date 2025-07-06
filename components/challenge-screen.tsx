"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useGame } from "@/hooks/use-game"
import type { Game, Challenge } from "@/lib/types"
import { Clock, Users, Trophy, CheckCircle, XCircle, Timer, Brain, BookOpen, Users2, Zap } from "lucide-react"

interface ChallengeScreenProps {
  gameId: string
  game: Game
  challenge: Challenge
  timeLeft: number
}

export function ChallengeScreen({ gameId, game, challenge, timeLeft }: ChallengeScreenProps) {
  const { user } = useAuth()
  const { submitChallengeAnswer, finishChallenge } = useGame(gameId)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [challengeFinished, setChallengeFinished] = useState(false)

  const activePlayers = Object.values(game.players).filter((p) => !p.isEliminated)
  const currentPlayer = user ? game.players[user.uid] : null
  const submissions = game.challengeSubmissions || {}
  const submittedPlayers = Object.keys(submissions)
  const hasUserSubmitted = user ? submittedPlayers.includes(user.uid) : false

  // Check if all active players have submitted
  const allPlayersSubmitted = activePlayers.every((player) => submittedPlayers.includes(player.uid))

  // Check if user already submitted
  useEffect(() => {
    if (hasUserSubmitted) {
      setSubmitted(true)
      const userSubmission = submissions[user!.uid]
      if (userSubmission) {
        setScore(userSubmission.score)
        setSelectedAnswer(userSubmission.answer)
      }
    }
  }, [hasUserSubmitted, submissions, user])

  // Auto-finish challenge when all players submit or time runs out
  useEffect(() => {
    if ((allPlayersSubmitted || timeLeft <= 0) && !challengeFinished && submittedPlayers.length > 0) {
      setChallengeFinished(true)
      // Add a small delay to show final state before elimination
      setTimeout(() => {
        finishChallenge(gameId)
      }, 2000)
    }
  }, [allPlayersSubmitted, timeLeft, challengeFinished, submittedPlayers.length, finishChallenge, gameId])

  const handleSubmit = async () => {
    if (!user || !selectedAnswer || submitted) return

    setSubmitted(true)

    // Calculate score based on correctness and time
    let newScore = 0
    let isCorrect = false
    if (selectedAnswer === challenge.correctAnswer) {
      isCorrect = true
      newScore = Math.max(10, Math.floor((timeLeft / challenge.timeLimit) * 100))
    }

    setScore(newScore)

    // Submit answer with timestamp
    await submitChallengeAnswer(gameId, user.uid, selectedAnswer, isCorrect, newScore)
  }

  const timeProgress = (timeLeft / challenge.timeLimit) * 100

  // Get submission order and categorize by correctness
  const getSubmissionStats = () => {
    const sortedSubmissions = Object.entries(submissions)
      .map(([playerId, submission]) => ({
        playerId,
        playerName: game.players[playerId]?.displayName || "Unknown",
        submittedAt: submission.submittedAt,
        isCorrect: submission.isCorrect,
        answer: submission.answer,
      }))
      .sort((a, b) => a.submittedAt - b.submittedAt)

    const correctSubmissions = sortedSubmissions.filter((s) => s.isCorrect)
    const incorrectSubmissions = sortedSubmissions.filter((s) => !s.isCorrect)

    return { correctSubmissions, incorrectSubmissions, allSubmissions: sortedSubmissions }
  }

  const { correctSubmissions, incorrectSubmissions, allSubmissions } = getSubmissionStats()

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <BookOpen className="h-4 w-4" />
      case "logic":
        return <Brain className="h-4 w-4" />
      case "social":
        return <Users2 className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getChallengeTypeText = (type: string) => {
    switch (type) {
      case "quiz":
        return "Асуулт хариулт"
      case "logic":
        return "Логик сэтгэлгээ"
      case "social":
        return "Нийгмийн мэдлэг"
      default:
        return "Асуулт хариулт"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "hard":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Амархан"
      case "medium":
        return "Дунд зэрэг"
      case "hard":
        return "Хэцүү"
      default:
        return "Тодорхойгүй"
    }
  }

  const getTimeRangeText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "30с - 1мин"
      case "medium":
        return "1 - 2мин"
      case "hard":
        return "2 - 3мин"
      default:
        return "Тодорхойгүй"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {getChallengeIcon(challenge.type)}
              {challenge.title}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-red-300">{game.currentRound}-р шат</p>
              <Badge className={`${getDifficultyColor(challenge.difficulty)} border-current`}>
                {getChallengeTypeText(challenge.type)} • {getDifficultyText(challenge.difficulty)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {activePlayers.length} тоглогч
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {game.prizePool}₮
            </Badge>
          </div>
        </div>

        {/* Time and Progress Card */}
        <Card className="mb-6 border-red-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                Үлдсэн хугацаа: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </CardTitle>
              <div className="flex items-center gap-2">
                {allPlayersSubmitted && (
                  <Badge className="bg-green-600 text-white animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    Бүгд илгээсэн!
                  </Badge>
                )}
                <Badge variant={timeLeft > 30 ? "default" : "destructive"}>
                  {timeLeft > 30 ? "Идэвхтэй" : "Яарна уу!"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Хугацааны хязгаар: {getTimeRangeText(challenge.difficulty)}</span>
              <span>
                {submittedPlayers.length}/{activePlayers.length} илгээсэн
              </span>
            </div>
            <Progress value={timeProgress} className="w-full" />
          </CardHeader>
        </Card>

        {/* Challenge Content */}
        <Card className="border-red-800 mb-6">
          <CardHeader>
            <CardTitle>{challenge.question}</CardTitle>
            <CardDescription>{challenge.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {challenge.options && (
              <div className="space-y-4">
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                  disabled={submitted || timeLeft <= 0 || challengeFinished}
                >
                  {challenge.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center pt-4">
                  <div>
                    {submitted && (
                      <div className="space-y-1">
                        <Badge variant={score > 0 ? "default" : "destructive"}>
                          {score > 0 ? `+${score} оноо` : "Буруу"}
                        </Badge>
                        {score > 0 && <p className="text-sm text-green-600">Зөв! Хурдны урамшуулал нэмэгдлээ.</p>}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer || submitted || timeLeft <= 0 || challengeFinished}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {submitted ? "Илгээсэн" : challengeFinished ? "Дууссан" : "Хариу илгээх"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Status with New Rules */}
        <Card className="mb-6 border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Илгээлтийн байдал ({submittedPlayers.length}/{activePlayers.length})
              {allPlayersSubmitted && <Badge className="bg-green-600 text-white ml-2">Бүгд дууслаа!</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Incorrect Submissions */}
              {incorrectSubmissions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Буруу хариулсан ({incorrectSubmissions.length})
                  </h4>
                  <div className="space-y-2">
                    {incorrectSubmissions.map((submission, index) => (
                      <div
                        key={submission.playerId}
                        className="flex items-center justify-between p-2 bg-red-900/30 rounded border border-red-500/30"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span
                            className={`font-medium ${submission.playerId === user?.uid ? "text-blue-400" : "text-red-300"}`}
                          >
                            {submission.playerName}
                          </span>
                          <XCircle className="h-4 w-4 text-red-500" />
                          {index === 0 && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              Хасагдах магадлалтай
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Submissions */}
              {correctSubmissions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Зөв хариулсан ({correctSubmissions.length})
                  </h4>
                  <div className="space-y-2">
                    {correctSubmissions.map((submission, index) => (
                      <div
                        key={submission.playerId}
                        className="flex items-center justify-between p-2 bg-green-900/30 rounded border border-green-500/30"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs bg-green-600">
                            #{index + 1}
                          </Badge>
                          <span
                            className={`font-medium ${submission.playerId === user?.uid ? "text-blue-400" : "text-green-300"}`}
                          >
                            {submission.playerName}
                          </span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {index === correctSubmissions.length - 1 && incorrectSubmissions.length === 0 && (
                            <Badge variant="secondary" className="text-xs animate-pulse bg-orange-600">
                              Хасагдах магадлалтай
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show players who haven't submitted yet */}
              {activePlayers
                .filter((player) => !submittedPlayers.includes(player.uid))
                .map((player) => (
                  <div
                    key={player.uid}
                    className="flex items-center justify-between p-2 bg-yellow-900/30 rounded border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-yellow-600">
                        Хүлээгдэж байна
                      </Badge>
                      <span className={`font-medium ${player.uid === user?.uid ? "text-blue-400" : "text-yellow-300"}`}>
                        {player.displayName}
                      </span>
                    </div>
                    <Timer className="h-4 w-4 text-orange-500" />
                  </div>
                ))}
            </div>

            {/* Challenge completion status */}
            {challengeFinished && (
              <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded text-center">
                <div className="flex items-center justify-center gap-2 text-blue-300">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">Даалгавар дууслаа! Хасах үйл явц эхэлж байна...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning about new elimination rules */}
        <Card className="border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <Timer className="h-5 w-5" />
              <div>
                <p className="font-semibold">Шинэ тоглоомын урсгал!</p>
                <div className="text-sm space-y-1">
                  <p>1️⃣ Хүлээлгийн өрөө → 2️⃣ Даалгавар → 3️⃣ Хасах → 4️⃣ Санал хураалт → 5️⃣ Дахин давтах</p>
                  <p>🔴 Буруу хариулсан эхэнд хасагдана</p>
                  <p>🟡 Зөв хариулсан дундаас хамгийн сүүлд илгээсэн хасагдана</p>
                  <p>⚡ Бүх тоглогч илгээсэн бол хугацаа дуусна</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
