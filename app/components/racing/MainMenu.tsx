"use client";

import { Button } from "../DemoComponents";
import { PlayerProfile } from "./GameManager";

interface MainMenuProps {
  playerProfile: PlayerProfile;
  onStartGame: () => void;
  onViewLeaderboard: () => void;
  onViewProfile: () => void;
  onLogout: () => void;
}

export function MainMenu({ 
  playerProfile, 
  onStartGame, 
  onViewLeaderboard, 
  onViewProfile,
  onLogout 
}: MainMenuProps) {
  
  const formatFID = (fid: string) => 
    `FID: ${fid}`;

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${distance}m`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] p-6">
      {/* Header with Player Info */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🏁</div>
        <h2 className="text-2xl font-bold text-[var(--app-accent)] mb-2">
          Welcome Back, {playerProfile.username}!
        </h2>
        <p className="text-[var(--app-foreground-muted)] text-sm">
          {formatFID(playerProfile.fid)}
        </p>
        {playerProfile.displayName && (
          <p className="text-[var(--app-foreground-muted)] text-xs mt-1">
            {playerProfile.displayName}
          </p>
        )}
      </div>

      {/* Player Stats Card */}
      <div className="mb-6 p-4 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-card-border)] shadow-lg">
        <h3 className="text-lg font-bold text-[var(--app-foreground)] mb-4 text-center">
          🏆 Racing Statistics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {playerProfile.totalGames}
            </div>
            <div className="text-xs text-blue-700 font-medium">
              Total Races
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {playerProfile.bestScore.toLocaleString()}
            </div>
            <div className="text-xs text-green-700 font-medium">
              Best Score
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {formatDistance(playerProfile.totalDistance)}
            </div>
            <div className="text-xs text-purple-700 font-medium">
              Total Distance
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {playerProfile.averageSpeed}
            </div>
            <div className="text-xs text-orange-700 font-medium">
              Avg Speed (km/h)
            </div>
          </div>
        </div>
      </div>

      {/* Game Actions */}
      <div className="flex-1 space-y-4">
        {/* Start Race Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onStartGame}
          className="w-full text-xl font-bold py-6 bg-gradient-to-r from-[var(--app-accent)] to-blue-500 hover:from-[var(--app-accent-hover)] hover:to-blue-600 shadow-lg"
        >
          🚀 Start New Race
        </Button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onViewLeaderboard}
            className="flex flex-col items-center py-3 space-y-1"
          >
            <span className="text-lg">🏆</span>
            <span className="text-xs font-medium">Leaderboard</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onViewProfile}
            className="flex flex-col items-center py-3 space-y-1"
          >
            <span className="text-lg">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => {/* TODO: Settings */}}
            className="flex flex-col items-center py-3 space-y-1"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-xs font-medium">Settings</span>
          </Button>
        </div>

        {/* Game Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2">🎮 How to Play</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use arrow keys to steer and accelerate</li>
            <li>• Stay on the road to maintain speed</li>
            <li>• Higher speeds = more points</li>
            <li>• Complete races to climb the leaderboard</li>
          </ul>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t border-[var(--app-card-border)] flex justify-between items-center">
        <div className="text-xs text-[var(--app-foreground-muted)]">
          {playerProfile.loginTransactionHash ? 
            'Registered via transaction' : 
            'Free registration'
          }
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}