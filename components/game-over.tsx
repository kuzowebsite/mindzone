"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Game } from "@/lib/types"
import { Trophy, DollarSign, Users, Home } from "lucide-react"

interface GameOverProps {
  game: Game
  onLeaveGame: () => void
}

export function GameOver({ game, onLeaveGame }: GameOverProps) {
  const activePlayers = Object.values(game.players).filter((p) => !p.isEliminated)
  const winner = game.winnerId ? game.players[game.winnerId] : null
  const isSplit = !winner && activePlayers.length > 1
  const prizePerPlayer = isSplit ? Math.floor(game.prizePool / activePlayers.length) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Тоглоом дууслаа</h1>
          {winner ? (
            <div className="space-y-2">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold text-yellow-500">{winner.displayName} хожлоо!</h2>
              <p className="text-red-300">Сүүлд үлдсэн тоглогч бүгдийг авлаа</p>
            </div>
          ) : (
            <div className="space-y-2">
              <DollarSign className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-500">Шагнал хуваагдлаа!</h2>
              <p className="text-red-300">Тоглогчид дуусгаж шагналыг хуваахаар санал өглөө</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trophy className="h-5 w-5" />
                Шагналын хуваарилалт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-4">{game.prizePool}₮</div>
                {winner ? (
                  <div>
                    <Badge variant="default" className="text-lg px-4 py-2 mb-2">
                      Ялагч бүгдийг авна
                    </Badge>
                    <p className="text-sm text-gray-600">{winner.displayName} бүх шагналын санг авлаа</p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="secondary" className="text-lg px-4 py-2 mb-2">
                      {prizePerPlayer}₮ тус бүр
                    </Badge>
                    <p className="text-sm text-gray-600">{activePlayers.length} үлдсэн тоглогчид хуваалцлаа</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Users className="h-5 w-5" />
                Эцсийн байрлал
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(game.players)
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div key={player.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
                        <span className={`font-medium ${player.isEliminated ? "line-through text-gray-500" : ""}`}>
                          {player.displayName}
                        </span>
                        {player.isEliminated && (
                          <Badge variant="destructive" className="text-xs">
                            Хасагдсан
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{player.score} оноо</Badge>
                        {!player.isEliminated && (
                          <Badge variant="secondary" className="text-green-600">
                            {winner && winner.uid === player.uid ? game.prizePool : prizePerPlayer}₮
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-red-800">
          <CardHeader>
            <CardTitle>Тоглоомын статистик</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{game.currentRound}</div>
                <p className="text-sm text-gray-600">Тоглосон шат</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{Object.keys(game.players).length}</div>
                <p className="text-sm text-gray-600">Нийт тоглогч</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Object.values(game.players).filter((p) => p.isEliminated).length}
                </div>
                <p className="text-sm text-gray-600">Хасагдсан</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button onClick={onLeaveGame} className="bg-red-600 hover:bg-red-700" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Лобби руу буцах
          </Button>
        </div>
      </div>
    </div>
  )
}
