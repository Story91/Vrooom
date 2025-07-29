"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../DemoComponents";
import { PlayerProfile } from "./GameManager";

interface LeaderboardScreenProps {
  currentPlayer: PlayerProfile;
  onBack: () => void;
}

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  address: string;
  bestScore: number;
  totalGames: number;
  totalDistance: number;
  averageSpeed: number;
  isCurrentPlayer?: boolean;
}

export function LeaderboardScreen({ currentPlayer, onBack }: LeaderboardScreenProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'score' | 'distance' | 'speed'>('score');
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(() => {
    setLoading(true);
    
    // Simulate loading from localStorage and generate sample data
    setTimeout(() => {
      const allProfiles: PlayerProfile[] = [];
      
      // Load current player
      allProfiles.push(currentPlayer);
      
      // Generate some sample leaderboard data for demo
      const samplePlayers = [
        { nickname: "SpeedRacer", bestScore: 15420, totalGames: 45, totalDistance: 12500, averageSpeed: 42 },
        { nickname: "RoadWarrior", bestScore: 14850, totalGames: 38, totalDistance: 11200, averageSpeed: 41 },
        { nickname: "TurboMax", bestScore: 13990, totalGames: 52, totalDistance: 15800, averageSpeed: 39 },
        { nickname: "NitroBoost", bestScore: 13420, totalGames: 29, totalDistance: 9800, averageSpeed: 44 },
        { nickname: "FastLane", bestScore: 12680, totalGames: 41, totalDistance: 13200, averageSpeed: 38 },
        { nickname: "DriftKing", bestScore: 12150, totalGames: 35, totalDistance: 10500, averageSpeed: 40 },
        { nickname: "RaceAce", bestScore: 11900, totalGames: 28, totalDistance: 8900, averageSpeed: 43 },
        { nickname: "VroomVroom", bestScore: 11420, totalGames: 33, totalDistance: 11800, averageSpeed: 37 },
        { nickname: "HighwayKing", bestScore: 10950, totalGames: 26, totalDistance: 7200, averageSpeed: 45 },
        { nickname: "CircuitMaster", bestScore: 10380, totalGames: 31, totalDistance: 9200, averageSpeed: 36 }
      ];

      // Add sample players if they don't exist
      samplePlayers.forEach((sample) => {
        allProfiles.push({
          fid: `${Math.random().toString(16).slice(2, 10)}`,
          username: sample.nickname.toLowerCase(),
          address: `0x${Math.random().toString(16).slice(2, 10)}`,
          nickname: sample.nickname,
          bestScore: sample.bestScore,
          totalGames: sample.totalGames,
          totalDistance: sample.totalDistance,
          averageSpeed: sample.averageSpeed,
          loginTransactionHash: `0x${Math.random().toString(16).slice(2)}`
        });
      });

      // Sort and rank based on active tab
      const sortedProfiles = [...allProfiles];
      switch (activeTab) {
        case 'score':
          sortedProfiles.sort((a, b) => b.bestScore - a.bestScore);
          break;
        case 'distance':
          sortedProfiles.sort((a, b) => b.totalDistance - a.totalDistance);
          break;
        case 'speed':
          sortedProfiles.sort((a, b) => b.averageSpeed - a.averageSpeed);
          break;
      }

      // Convert to leaderboard entries with rank
      const leaderboardData: LeaderboardEntry[] = sortedProfiles.map((profile, index) => ({
        rank: index + 1,
        nickname: profile.nickname,
        address: profile.address,
        bestScore: profile.bestScore,
        totalGames: profile.totalGames,
        totalDistance: profile.totalDistance,
        averageSpeed: profile.averageSpeed,
        isCurrentPlayer: profile.address === currentPlayer.address
      }));

      setLeaderboard(leaderboardData);
      setLoading(false);
    }, 1000);
  }, [activeTab, currentPlayer]);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, loadLeaderboard]);

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${distance}m`;
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case 2: return "text-gray-600 bg-gray-50 border-gray-200";
      case 3: return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-[var(--app-foreground)] bg-[var(--app-card-bg)] border-[var(--app-card-border)]";
    }
  };

  const getStatValue = (entry: LeaderboardEntry) => {
    switch (activeTab) {
      case 'score': return entry.bestScore.toLocaleString();
      case 'distance': return formatDistance(entry.totalDistance);
      case 'speed': return `${entry.averageSpeed} km/h`;
    }
  };

  const currentPlayerEntry = leaderboard.find(entry => entry.isCurrentPlayer);

  return (
    <div className="flex flex-col min-h-[600px] bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] rounded-xl p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-[var(--app-accent)] mb-2">
          Leaderboard
        </h2>
        <p className="text-[var(--app-foreground-muted)]">
          See how you rank against other racers
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex bg-[var(--app-card-bg)] rounded-lg p-1 border border-[var(--app-card-border)]">
        {[
          { key: 'score', label: 'Best Score', icon: '🏆' },
          { key: 'distance', label: 'Distance', icon: '🛣️' },
          { key: 'speed', label: 'Avg Speed', icon: '⚡' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'score' | 'distance' | 'speed')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--app-accent)] text-white shadow-sm'
                : 'text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current Player Position */}
      {currentPlayerEntry && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-blue-600">
                {getRankEmoji(currentPlayerEntry.rank)}
              </div>
              <div>
                <div className="font-medium text-blue-800">Your Position</div>
                <div className="text-sm text-blue-600">
                  {currentPlayerEntry.nickname}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-blue-800">
                {getStatValue(currentPlayerEntry)}
              </div>
              <div className="text-xs text-blue-600">
                Rank {currentPlayerEntry.rank}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="flex-1 space-y-2 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-[var(--app-foreground-muted)]">Loading leaderboard...</p>
          </div>
        ) : (
          leaderboard.slice(0, 20).map((entry) => (
            <div
              key={entry.address}
              className={`p-3 rounded-lg border transition-all ${
                entry.isCurrentPlayer
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                  : getRankColor(entry.rank)
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-bold ${entry.rank <= 3 ? '' : 'text-[var(--app-foreground-muted)]'}`}>
                    {getRankEmoji(entry.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--app-foreground)]">
                      {entry.nickname}
                      {entry.isCurrentPlayer && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--app-foreground-muted)]">
                      {formatAddress(entry.address)} • {entry.totalGames} races
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--app-foreground)]">
                    {getStatValue(entry)}
                  </div>
                  <div className="text-xs text-[var(--app-foreground-muted)]">
                    {activeTab === 'score' && `${formatDistance(entry.totalDistance)}`}
                    {activeTab === 'distance' && `${entry.bestScore.toLocaleString()} pts`}
                    {activeTab === 'speed' && `${entry.bestScore.toLocaleString()} pts`}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-[var(--app-card-border)] space-y-3">
        <div className="text-center">
          <p className="text-xs text-[var(--app-foreground-muted)]">
            Showing top 20 racers • Updates in real-time
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          ← Back to Menu
        </Button>
      </div>
    </div>
  );
}