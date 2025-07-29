"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useNotification, useMiniKit, useViewProfile } from "@coinbase/onchainkit/minikit";
import { WelcomeScreen } from "./WelcomeScreen";
import { LoginScreen } from "./LoginScreen";
import { MainMenu } from "./MainMenu";
import { GameCountdown } from "./GameCountdown";
import { RacingGameCore } from "./RacingGameCore";
import { GameOverScreen } from "./GameOverScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";

// Game States
export type GameState = 
  | 'welcome'
  | 'login' 
  | 'menu'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'gameOver'
  | 'leaderboard';

// Game Data Interface
export interface GameSession {
  id: string;
  playerId: string; // Now using FID
  score: number;
  distance: number;
  time: number;
  maxSpeed: number;
  startTime: number;
  endTime?: number;
  transactionHash?: string;
}

// Player Profile - now using Farcaster data
export interface PlayerProfile {
  fid: string; // Farcaster ID
  username: string; // From Farcaster profile
  nickname: string; // Display nickname for the game
  address: string; // Wallet address
  displayName?: string; // From Farcaster profile
  totalGames: number;
  bestScore: number;
  totalDistance: number;
  averageSpeed: number;
  loginTransactionHash?: string;
}

export function GameManager() {
  // Game State
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [countdownValue, setCountdownValue] = useState(3);

  // MiniKit hooks
  const { context } = useMiniKit();
  const sendNotification = useNotification();
  const viewProfile = useViewProfile();

  // Web3 State
  const { address, isConnected } = useAccount();

  // Game Statistics
  const [gameStats, setGameStats] = useState({
    score: 0,
    distance: 0,
    speed: 0,
    time: 0,
    maxSpeed: 0
  });

  // Initialize game when context is available
  useEffect(() => {
    if (context?.user?.fid && gameState === 'welcome') {
      // Check if player is already logged in using FID
      const savedProfile = localStorage.getItem(`racing_profile_${context.user.fid}`);
      if (savedProfile) {
        setPlayerProfile(JSON.parse(savedProfile));
        setGameState('menu');
      } else {
        setGameState('login');
      }
    }
  }, [context, gameState]);

  // Handle successful login with Farcaster profile
  const handleLoginSuccess = useCallback(async (transactionHash?: string) => {
    if (!context?.user?.fid) return;

    // Get username from context or use viewProfile to get more data
    const fid = context.user.fid;
    
    // Create profile with Farcaster data
    const newProfile: PlayerProfile = {
      fid: fid.toString(),
      username: `racer_${fid}`, // Default username, can be enhanced with more Farcaster data
      nickname: `Racer ${fid}`, // Default nickname
      address: address || '', // Use connected wallet address
      displayName: `Racer ${fid}`,
      totalGames: 0,
      bestScore: 0,
      totalDistance: 0,
      averageSpeed: 0,
      loginTransactionHash: transactionHash
    };

    setPlayerProfile(newProfile);
    localStorage.setItem(`racing_profile_${fid}`, JSON.stringify(newProfile));
    
    await sendNotification({
      title: "🏁 Welcome to Vrooom Racing!",
      body: `Ready to race, ${newProfile.username}? Your profile is now active!`
    });

    setGameState('menu');
  }, [context, sendNotification, address]);

  // View Farcaster profile
  const handleViewProfile = useCallback((fid?: string) => {
    if (fid) {
      viewProfile(parseInt(fid));
    } else {
      viewProfile();
    }
  }, [viewProfile]);

  // Start new game session
  const startNewGame = useCallback(() => {
    if (!playerProfile || !context?.user?.fid) return;

    const session: GameSession = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId: context.user.fid.toString(),
      score: 0,
      distance: 0,
      time: 0,
      maxSpeed: 0,
      startTime: Date.now()
    };

    setCurrentSession(session);
    setGameStats({ score: 0, distance: 0, speed: 0, time: 0, maxSpeed: 0 });
    setCountdownValue(3);
    setGameState('countdown');
  }, [playerProfile, context]);

  // Handle countdown completion
  const handleCountdownComplete = useCallback(() => {
    setGameState('playing');
  }, []);

  // Update game statistics during play
  const updateGameStats = useCallback((newStats: Partial<typeof gameStats>) => {
    setGameStats(prev => ({ ...prev, ...newStats }));
    
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        score: newStats.score ?? prev.score,
        distance: newStats.distance ?? prev.distance,
        maxSpeed: Math.max(newStats.speed ?? 0, prev.maxSpeed),
        time: Date.now() - prev.startTime
      } : null);
    }
  }, [currentSession]);

  // End game session
  const endGameSession = useCallback(async () => {
    if (!currentSession || !playerProfile) return;

    const finalSession: GameSession = {
      ...currentSession,
      endTime: Date.now(),
      time: Date.now() - currentSession.startTime
    };

    // Update player profile
    const updatedProfile: PlayerProfile = {
      ...playerProfile,
      totalGames: playerProfile.totalGames + 1,
      bestScore: Math.max(playerProfile.bestScore, finalSession.score),
      totalDistance: playerProfile.totalDistance + finalSession.distance,
      averageSpeed: Math.round(
        (playerProfile.averageSpeed * playerProfile.totalGames + gameStats.maxSpeed) / 
        (playerProfile.totalGames + 1)
      )
    };

    setPlayerProfile(updatedProfile);
    localStorage.setItem(`racing_profile_${playerProfile.fid}`, JSON.stringify(updatedProfile));

    // Save game session
    const savedSessions = JSON.parse(localStorage.getItem('racing_sessions') || '[]');
    savedSessions.push(finalSession);
    localStorage.setItem('racing_sessions', JSON.stringify(savedSessions));

    await sendNotification({
      title: "🏁 Race Complete!",
      body: `Final Score: ${finalSession.score} | Distance: ${Math.round(finalSession.distance)}m`
    });

    setGameState('gameOver');
  }, [currentSession, playerProfile, gameStats, sendNotification]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  // Navigation functions
  const goToMenu = useCallback(() => setGameState('menu'), []);
  const goToLeaderboard = useCallback(() => setGameState('leaderboard'), []);
  const restartGame = useCallback(() => {
    setCurrentSession(null);
    startNewGame();
  }, [startNewGame]);

  // Render current screen based on game state
  const renderCurrentScreen = () => {
    switch (gameState) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={() => setGameState('login')} />;
      
      case 'login':
        return (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setGameState('welcome')}
            context={context}
            onViewProfile={handleViewProfile}
          />
        );
      
      case 'menu':
        return (
          <MainMenu
            playerProfile={playerProfile!}
            onStartGame={startNewGame}
            onViewLeaderboard={goToLeaderboard}
            onViewProfile={() => handleViewProfile(playerProfile?.fid)}
            onLogout={() => {
              setPlayerProfile(null);
              if (context?.user?.fid) {
                localStorage.removeItem(`racing_profile_${context.user.fid}`);
              }
              setGameState('welcome');
            }}
          />
        );
      
      case 'countdown':
        return (
          <GameCountdown
            countdownValue={countdownValue}
            onCountdownUpdate={setCountdownValue}
            onCountdownComplete={handleCountdownComplete}
            onCancel={goToMenu}
          />
        );
      
      case 'playing':
      case 'paused':
        return (
          <RacingGameCore
            gameState={gameState}
            gameStats={gameStats}
            onUpdateStats={updateGameStats}
            onGameEnd={endGameSession}
            onTogglePause={togglePause}
            onQuitGame={goToMenu}
          />
        );
      
      case 'gameOver':
        return (
          <GameOverScreen
            session={currentSession!}
            playerProfile={playerProfile!}
            onPlayAgain={restartGame}
            onMainMenu={goToMenu}
            onViewLeaderboard={goToLeaderboard}
          />
        );
      
      case 'leaderboard':
        return (
          <LeaderboardScreen
            currentPlayer={playerProfile!}
            onBack={goToMenu}
          />
        );
      
      default:
        return <WelcomeScreen onGetStarted={() => setGameState('login')} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Game Status Bar */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="p-2 bg-[var(--app-card-bg)] border-b border-[var(--app-card-border)]">
          <div className="flex justify-between text-xs font-medium">
            <span>Score: {gameStats.score}</span>
            <span>Speed: {gameStats.speed} km/h</span>
            <span>Distance: {Math.round(gameStats.distance)}m</span>
          </div>
        </div>
      )}

      {/* Main Game Screen - Full Height */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentScreen()}
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-gray-100 text-xs border-t">
          <div>State: {gameState}</div>
          <div>FID: {context?.user?.fid || 'None'}</div>
          <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
          <div>Profile: {playerProfile?.username || 'None'}</div>
          <div>Added: {context?.client?.added ? 'Yes' : 'No'}</div>
          <div>Location: {typeof context?.location === 'string' ? context.location : JSON.stringify(context?.location) || 'Unknown'}</div>
        </div>
      )}
    </div>
  );
}