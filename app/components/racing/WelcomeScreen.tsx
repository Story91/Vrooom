"use client";

import { Button } from "../DemoComponents";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] p-6">
      {/* Game Logo */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🏎️</div>
        <h1 className="text-3xl font-bold text-[var(--app-accent)] mb-2">
          Vrooom
        </h1>
        <p className="text-[var(--app-foreground-muted)] text-base">
          Racing on Base
        </p>
      </div>

      {/* Game Preview/Screenshot placeholder */}
      <div className="mb-6 flex justify-center">
        <div className="w-56 h-36 bg-gradient-to-b from-blue-200 via-green-200 to-gray-300 rounded-lg border-2 border-[var(--app-card-border)] overflow-hidden">
          {/* Mock racing scene */}
          <div className="h-1/3 bg-gradient-to-b from-blue-300 to-blue-400"></div>
          <div className="h-1/3 bg-gradient-to-b from-green-300 to-green-400 relative">
            {/* Mock mountains */}
            <div className="absolute bottom-0 w-full h-6 bg-green-600 clip-triangle"></div>
          </div>
          <div className="h-1/3 bg-gray-400 relative">
            {/* Mock road */}
            <div className="absolute inset-x-3 top-0 bottom-0 bg-gray-600 transform perspective-road">
              <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800"></div>
              {/* Road lines */}
              <div className="absolute inset-x-1/2 top-0 bottom-0 w-0.5 bg-yellow-300 transform -translate-x-0.5"></div>
            </div>
            {/* Mock car */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-5 h-3 bg-red-500 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Game Features */}
      <div className="mb-6 space-y-3 text-center">
        <div className="flex items-center justify-center space-x-2 text-[var(--app-foreground)]">
          <span className="text-xl">🏁</span>
          <span className="text-sm font-medium">3D Racing Action</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-[var(--app-foreground)]">
          <span className="text-xl">⚡</span>
          <span className="text-sm font-medium">Web3 Powered</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-[var(--app-foreground)]">
          <span className="text-xl">🏆</span>
          <span className="text-sm font-medium">Global Leaderboard</span>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-auto space-y-4 w-full max-w-xs mx-auto">
        <Button
          variant="primary"
          size="lg"
          onClick={onGetStarted}
          className="w-full text-lg font-bold py-4"
        >
          🚀 Get Started
        </Button>
        
        <p className="text-xs text-center text-[var(--app-foreground-muted)]">
          Connect your wallet to start racing
        </p>
      </div>

      {/* Version/Credits */}
      <div className="mt-4 text-center">
        <p className="text-xs text-[var(--app-foreground-muted)]">
          Powered by Base & MiniKit
        </p>
        <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
          v1.0.0 • Built with ❤️
        </p>
      </div>
    </div>
  );
}