"use client";

import { useState, useEffect } from "react";
import { Button } from "../DemoComponents";
import { GameSession, PlayerProfile } from "./GameManager";

interface GameOverScreenProps {
  session: GameSession;
  playerProfile: PlayerProfile;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onViewLeaderboard: () => void;
}

export function GameOverScreen({
  session,
  playerProfile,
  onPlayAgain,
  onMainMenu,
  onViewLeaderboard
}: GameOverScreenProps) {
  const [showStats, setShowStats] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    // Animate stats appearance
    setTimeout(() => setShowStats(true), 500);
    
    // Calculate achievements
    const newAchievements: string[] = [];
    
    if (session.score > playerProfile.bestScore) {
      newAchievements.push("🏆 New Personal Best!");
    }
    
    if (session.maxSpeed >= 45) {
      newAchievements.push("⚡ Speed Demon!");
    }
    
    if (session.distance >= 1000) {
      newAchievements.push("🛣️ Long Distance Driver!");
    }
    
    if (session.time >= 60000) { // 1 minute
      newAchievements.push("⏰ Endurance Racer!");
    }
    
    if (playerProfile.totalGames % 10 === 0) {
      newAchievements.push("🎯 Milestone Reached!");
    }
    
    setAchievements(newAchievements);
  }, [session, playerProfile]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${Math.round(distance)}m`;
  };

  const getPerformanceGrade = () => {
    const scoreRatio = session.score / Math.max(playerProfile.bestScore, 1);
    if (scoreRatio >= 1.0) return { grade: 'S', color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' };
    if (scoreRatio >= 0.8) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-50 border-green-200' };
    if (scoreRatio >= 0.6) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' };
    if (scoreRatio >= 0.4) return { grade: 'C', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' };
    return { grade: 'D', color: 'text-red-500', bg: 'bg-red-50 border-red-200' };
  };

  const performance = getPerformanceGrade();

  return (
    <div className="flex flex-col min-h-[600px] bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] rounded-xl p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏁</div>
        <h2 className="text-3xl font-bold text-[var(--app-accent)] mb-2">
          Race Complete!
        </h2>
        <p className="text-[var(--app-foreground-muted)]">
          Well done, {playerProfile.nickname}!
        </p>
      </div>

      {/* Performance Grade */}
      <div className={`mb-6 p-4 rounded-xl border text-center ${performance.bg}`}>
        <div className={`text-4xl font-bold ${performance.color} mb-2`}>
          {performance.grade}
        </div>
        <div className="text-sm font-medium text-gray-700">
          Performance Grade
        </div>
      </div>

      {/* Race Statistics */}
      <div className={`mb-6 transition-all duration-700 ${showStats ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-card-border)]">
            <div className="text-2xl font-bold text-[var(--app-accent)] mb-1">
              {session.score.toLocaleString()}
            </div>
            <div className="text-xs text-[var(--app-foreground-muted)]">
              Final Score
            </div>
          </div>

          <div className="text-center p-4 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-card-border)]">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatDistance(session.distance)}
            </div>
            <div className="text-xs text-[var(--app-foreground-muted)]">
              Distance Traveled
            </div>
          </div>

          <div className="text-center p-4 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-card-border)]">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {session.maxSpeed}
            </div>
            <div className="text-xs text-[var(--app-foreground-muted)]">
              Max Speed (km/h)
            </div>
          </div>

          <div className="text-center p-4 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-card-border)]">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatTime(session.time)}
            </div>
            <div className="text-xs text-[var(--app-foreground-muted)]">
              Race Time
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <h3 className="text-lg font-bold text-orange-800 mb-3 text-center">
            🎉 Achievements Unlocked!
          </h3>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-sm font-medium text-orange-700 animate-bounce"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <span>{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress vs Personal Best */}
      {session.score !== playerProfile.bestScore && (
        <div className="mb-6 p-4 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-card-border)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--app-foreground-muted)]">Progress to PB</span>
            <span className="text-sm font-medium text-[var(--app-foreground)]">
              {Math.round((session.score / playerProfile.bestScore) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((session.score / playerProfile.bestScore) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-[var(--app-foreground-muted)] mt-1">
            Personal Best: {playerProfile.bestScore.toLocaleString()}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4 mt-auto">
        <Button
          variant="primary"
          size="lg"
          onClick={onPlayAgain}
          className="w-full text-lg font-bold py-4"
        >
          🚀 Race Again
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="md"
            onClick={onViewLeaderboard}
            className="flex flex-col items-center py-3 space-y-1"
          >
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-medium">Leaderboard</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onMainMenu}
            className="flex flex-col items-center py-3 space-y-1"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-sm font-medium">Main Menu</span>
          </Button>
        </div>
      </div>

      {/* Session ID for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-center">
          <div className="text-xs text-[var(--app-foreground-muted)]">
            Session ID: {session.id}
          </div>
        </div>
      )}
    </div>
  );
}