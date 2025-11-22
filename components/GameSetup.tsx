'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';

export default function GameSetup() {
  const { gameState, addPlayer, removePlayer, startGame } = useGame();
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      addPlayer(playerName.trim());
      setPlayerName('');
    }
  };

  const canStart = gameState.players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-black text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          AI SLOP
        </h1>
        <p className="text-center text-gray-600 mb-8">The Game!</p>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Players ({gameState.players.length})</h2>
          {gameState.players.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No players yet...</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {gameState.players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2"
                >
                  <span className="font-medium">{player.name}</span>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleAddPlayer} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Min: 2 players | Max: {gameState.settings.maxPlayers}
          </p>
        </form>

        <button
          onClick={startGame}
          disabled={!canStart}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {canStart ? 'START GAME' : 'Need at least 2 players'}
        </button>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-bold text-sm mb-2">How to Play:</h3>
          <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
            <li>First player fills in a mad lib prompt</li>
            <li>AI generates an image from the prompt</li>
            <li>Next player sees only the image and guesses the prompt</li>
            <li>Repeat until everyone has a turn</li>
            <li>Watch the hilarious drift in the replay!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
