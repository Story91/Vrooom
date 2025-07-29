"use client";

import { useEffect, useState } from "react";
import { Button } from "../DemoComponents";

interface GameCountdownProps {
  countdownValue: number;
  onCountdownUpdate: (value: number) => void;
  onCountdownComplete: () => void;
  onCancel: () => void;
}

export function GameCountdown({ 
  countdownValue, 
  onCountdownUpdate, 
  onCountdownComplete, 
  onCancel 
}: GameCountdownProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (countdownValue > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (countdownValue === 1) {
          // Start the race!
          setTimeout(() => {
            onCountdownComplete();
          }, 500);
        } else {
          onCountdownUpdate(countdownValue - 1);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdownValue, onCountdownUpdate, onCountdownComplete]);

  const getCountdownText = () => {
    switch (countdownValue) {
      case 3: return "Ready...";
      case 2: return "Set...";
      case 1: return "GO!";
      default: return "Starting...";
    }
  };

  const getCountdownEmoji = () => {
    switch (countdownValue) {
      case 3: return "🏁";
      case 2: return "⚡";
      case 1: return "🚀";
      default: return "🏎️";
    }
  };

  const getCountdownColor = () => {
    switch (countdownValue) {
      case 3: return "text-red-500";
      case 2: return "text-yellow-500";
      case 1: return "text-green-500";
      default: return "text-[var(--app-accent)]";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] rounded-xl p-6">
      {/* Countdown Animation */}
      <div className="text-center mb-8">
        <div className={`text-8xl mb-4 transition-all duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}>
          {getCountdownEmoji()}
        </div>
        
        <div className={`text-8xl font-bold mb-4 transition-all duration-300 ${getCountdownColor()} ${isAnimating ? 'scale-110' : 'scale-100'}`}>
          {countdownValue > 0 ? countdownValue : ""}
        </div>
        
        <h2 className={`text-2xl font-bold transition-all duration-300 ${getCountdownColor()}`}>
          {getCountdownText()}
        </h2>
      </div>

      {/* Race Preparation Tips */}
      <div className="mb-8 p-6 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-card-border)] shadow-lg max-w-sm">
        <h3 className="text-lg font-bold text-[var(--app-foreground)] mb-4 text-center">
          🎯 Race Tips
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <span className="text-lg">⌨️</span>
            <div>
              <div className="font-medium text-[var(--app-foreground)]">Controls</div>
              <div className="text-[var(--app-foreground-muted)]">
                Use ← → to steer, ↑ to accelerate, ↓ to brake
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-lg">🛣️</span>
            <div>
              <div className="font-medium text-[var(--app-foreground)]">Stay on Track</div>
              <div className="text-[var(--app-foreground-muted)]">
                Leaving the road will slow you down
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-lg">⚡</span>
            <div>
              <div className="font-medium text-[var(--app-foreground)]">Speed = Points</div>
              <div className="text-[var(--app-foreground-muted)]">
                Maintain high speeds for better scores
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Road Preview */}
      <div className="mb-8">
        <div className="w-48 h-24 bg-gradient-to-b from-blue-200 via-green-200 to-gray-300 rounded-lg border border-[var(--app-card-border)] overflow-hidden relative">
          {/* Animated sky */}
          <div className="h-1/3 bg-gradient-to-r from-blue-300 to-blue-400 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          </div>
          
          {/* Ground */}
          <div className="h-1/3 bg-gradient-to-b from-green-300 to-green-400"></div>
          
          {/* Road with animation */}
          <div className="h-1/3 bg-gray-400 relative overflow-hidden">
            <div className="absolute inset-x-6 top-0 bottom-0 bg-gray-600">
              {/* Animated road lines */}
              <div className="absolute left-1/2 top-0 w-0.5 h-full transform -translate-x-0.5">
                <div className="w-full h-2 bg-yellow-300 animate-pulse"></div>
                <div className="w-full h-2 bg-transparent"></div>
                <div className="w-full h-2 bg-yellow-300 animate-pulse"></div>
                <div className="w-full h-2 bg-transparent"></div>
                <div className="w-full h-2 bg-yellow-300 animate-pulse"></div>
              </div>
            </div>
            
            {/* Animated car */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-red-500 rounded-sm animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="mt-auto">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
        >
          Cancel Race
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex space-x-2">
        {[3, 2, 1].map((num) => (
          <div
            key={num}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              countdownValue < num 
                ? 'bg-green-500' 
                : countdownValue === num 
                  ? 'bg-[var(--app-accent)] animate-pulse' 
                  : 'bg-[var(--app-card-border)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}