export interface Player {
  uid: string
  playerId: number
  displayName: string
  email: string
  score: number
  isEliminated: boolean
  joinedAt: number
}

export interface Challenge {
  id: string
  type: "quiz" | "logic" | "social"
  difficulty: "easy" | "medium" | "hard"
  title: string
  description: string
  question: string
  options?: string[]
  correctAnswer?: string
  timeLimit: number
  createdAt: number
}

export interface ChallengeSubmission {
  playerId: string
  answer: string
  submittedAt: number
  isCorrect?: boolean
  score: number
}

export interface Game {
  id: string
  hostId: string
  status: "scheduled" | "waiting" | "active" | "voting" | "ended"
  gameType?: "classic" | "individual" // New field for game type
  players: Record<string, Player>
  currentChallenge?: Challenge
  challengeSubmissions?: Record<string, ChallengeSubmission>
  prizePool: number
  ticketPrice: number
  minPlayers: number
  scheduledStartTime: number
  joinOpenTime: number
  ticketPurchaseDeadline: number
  createdAt: number
  currentRound: number
  winnerId?: string
}

export interface Vote {
  playerId: string
  choice: "continue" | "end"
  timestamp: number
}

export interface GameVotes {
  continue: Record<string, Vote>
  end: Record<string, Vote>
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  accountHolderName: string
  iban?: string // Only for non-Khan Bank
}

export interface InternalAccount {
  accountNumber: string
  displayName: string
  createdAt: number
  changeCount: number // Track how many times account has been changed
  lastChangedAt?: number
}

export interface WithdrawalRequest {
  id: string
  playerId: string
  playerName: string
  playerUid: string
  internalAccount: InternalAccount // Site's internal account info
  amount: number
  bankAccount: BankAccount
  status: "pending" | "completed" | "rejected"
  requestedAt: number
  processedAt?: number
  processedBy?: string
}

export interface DepositRequest {
  id: string
  playerId: string
  playerName: string
  playerUid: string
  internalAccount: InternalAccount // Site's internal account info
  amount: number
  bankAccount: BankAccount // Bank account that sent the money
  status: "pending" | "completed" | "rejected"
  requestedAt: number
  processedAt?: number
  processedBy?: string
}

export interface Transaction {
  id: string
  fromPlayerId: string
  fromPlayerName: string
  fromPlayerUid: string
  toPlayerId: string
  toPlayerName: string
  toPlayerUid: string
  amount: number
  description: string
  timestamp: number
}

export interface UserProfile {
  uid: string
  playerId: number
  displayName: string
  email: string
  role: "player" | "organizer"
  createdAt: number
  lastLoginAt: number
  gamesPlayed: number
  totalWinnings: number // Total balance including transfers
  gameWinnings: number // Only winnings from games (for ranking)
  highestScore: number
  isActive: boolean
  profileImage?: string
  internalAccount?: InternalAccount
}

export interface PlayerIndex {
  uid: string
  displayName: string
  playerId: number
  role: "player" | "organizer"
  createdAt: number
}
