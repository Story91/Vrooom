"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { Button } from "../DemoComponents";

interface LoginScreenProps {
  onLoginSuccess: (transactionHash?: string) => void;
  onBack: () => void;
  context: any; // MiniKit context
  onViewProfile: (fid?: string) => void;
}

export function LoginScreen({ 
  onLoginSuccess, 
  onBack, 
  context, 
  onViewProfile 
}: LoginScreenProps) {
  const { address, isConnected } = useAccount();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [step, setStep] = useState<'connect' | 'farcaster' | 'transaction'>('connect');

  // Free transaction - 0 ETH to register player
  const loginCalls = address ? [
    {
      to: address,
      data: "0x" as `0x${string}`,
      value: BigInt(0), // FREE transaction!
    },
  ] : [];

  const handleWalletConnected = useCallback(() => {
    if (isConnected && address) {
      setStep('farcaster');
    }
  }, [isConnected, address]);

  const handleFarcasterReady = useCallback(() => {
    if (context?.user?.fid) {
      setStep('transaction');
    }
  }, [context]);

  const handleTransactionSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;
    setIsLoggingIn(false);
    onLoginSuccess(transactionHash);
  }, [onLoginSuccess]);

  const handleTransactionError = useCallback((error: TransactionError) => {
    console.error("Login transaction failed:", error);
    setIsLoggingIn(false);
    setStep('farcaster'); // Go back to farcaster step
  }, []);

  // Auto-advance based on context
  useEffect(() => {
    if (isConnected && address && step === 'connect') {
      handleWalletConnected();
    }
    if (context?.user?.fid && step === 'farcaster') {
      handleFarcasterReady();
    }
  }, [isConnected, address, context, step, handleWalletConnected, handleFarcasterReady]);

  // Skip transaction for now - direct login
  const handleDirectLogin = useCallback(() => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      onLoginSuccess(); // No transaction hash for free login
    }, 1000);
  }, [onLoginSuccess]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[var(--app-background)] to-[var(--app-gray)] p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-[var(--app-accent)] mb-2">
          Join the Race
        </h2>
        <p className="text-[var(--app-foreground-muted)]">
          Connect your wallet and verify with Farcaster
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step === 'connect' ? 'text-[var(--app-accent)]' : step !== 'connect' ? 'text-green-500' : 'text-[var(--app-foreground-muted)]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'connect' ? 'bg-[var(--app-accent)] text-white' : step !== 'connect' ? 'bg-green-500 text-white' : 'bg-[var(--app-card-bg)] border border-[var(--app-card-border)]'}`}>
            {step !== 'connect' ? '✓' : '1'}
          </div>
          <span className="text-sm font-medium">Connect</span>
        </div>

        <div className={`w-8 h-0.5 ${step === 'farcaster' || step === 'transaction' ? 'bg-green-500' : 'bg-[var(--app-card-border)]'}`}></div>

        <div className={`flex items-center space-x-2 ${step === 'farcaster' ? 'text-[var(--app-accent)]' : step === 'transaction' ? 'text-green-500' : 'text-[var(--app-foreground-muted)]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'farcaster' ? 'bg-[var(--app-accent)] text-white' : step === 'transaction' ? 'bg-green-500 text-white' : 'bg-[var(--app-card-bg)] border border-[var(--app-card-border)]'}`}>
            {step === 'transaction' ? '✓' : '2'}
          </div>
          <span className="text-sm font-medium">Farcaster</span>
        </div>

        <div className={`w-8 h-0.5 ${step === 'transaction' ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-card-border)]'}`}></div>

        <div className={`flex items-center space-x-2 ${step === 'transaction' ? 'text-[var(--app-accent)]' : 'text-[var(--app-foreground-muted)]'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'transaction' ? 'bg-[var(--app-accent)] text-white' : 'bg-[var(--app-card-bg)] border border-[var(--app-card-border)]'}`}>
            3
          </div>
          <span className="text-sm font-medium">Register</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-6">
        {/* Step 1: Connect Wallet */}
        {step === 'connect' && (
          <div className="text-center space-y-4">
            <p className="text-[var(--app-foreground-muted)] text-sm mb-4">
              Connect your wallet to get started
            </p>
            
            <Wallet className="w-full">
              <ConnectWallet className="w-full">
                <div className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white font-bold py-4 px-6 rounded-lg transition-colors">
                  Connect Wallet
                </div>
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>

            {isConnected && address && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">
                  ✅ Wallet Connected!
                </p>
                <p className="text-green-600 text-xs mt-1">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Farcaster Context */}
        {step === 'farcaster' && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
              <h3 className="font-bold text-[var(--app-foreground)] mb-3">🎭 Farcaster Integration</h3>
              
              {context?.user?.fid ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm font-medium">
                      ✅ Farcaster Connected!
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      FID: {context.user.fid}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => onViewProfile(context.user.fid)}
                    className="w-full"
                  >
                    👤 View My Farcaster Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[var(--app-foreground-muted)] text-sm">
                    Make sure you're accessing this via Farcaster to get your profile data
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      ℹ️ Launch this Mini App from Farcaster for full functionality
                    </p>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setStep('transaction')}
                    className="w-full"
                  >
                    Continue Anyway
                  </Button>
                </div>
              )}
            </div>

            {/* Context Info */}
            <div className="text-xs text-[var(--app-foreground-muted)] space-y-1">
              <div>Location: {context?.location || 'Unknown'}</div>
              <div>Added: {context?.client?.added ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* Step 3: Free Registration */}
        {step === 'transaction' && (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-card-border)]">
              <h3 className="font-bold text-[var(--app-foreground)] mb-2">🎮 Ready to Race!</h3>
              <p className="text-sm text-[var(--app-foreground-muted)] mb-3">
                Complete your registration to start racing
              </p>
              
              {context?.user?.fid && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    🏁 <strong>Racer {context.user.fid}</strong>, ready to start?
                  </p>
                </div>
              )}

              <div className="text-lg font-bold text-green-600 mb-2">
                FREE Registration! 🎉
              </div>
              <p className="text-xs text-[var(--app-foreground-muted)]">
                No fees required - just confirm to start racing
              </p>
            </div>

            {/* Free Registration Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleDirectLogin}
              disabled={isLoggingIn}
              className="w-full text-lg font-bold py-4"
            >
              {isLoggingIn ? "Registering..." : "🚀 Start Racing"}
            </Button>

            {/* Optional: Transaction-based registration */}
            {address && false && ( // Disabled for now
              <div className="pt-4 border-t border-[var(--app-card-border)]">
                <p className="text-xs text-[var(--app-foreground-muted)] mb-3">
                  Or register with a transaction (optional):
                </p>
                <Transaction
                  calls={loginCalls}
                  onSuccess={handleTransactionSuccess}
                  onError={handleTransactionError}
                >
                  <TransactionButton 
                    className="w-full text-white text-sm bg-gray-500 hover:bg-gray-600 rounded-lg py-3"
                    disabled={isLoggingIn}
                  >
                    Register with Transaction
                  </TransactionButton>
                  <TransactionStatus>
                    <TransactionStatusAction />
                    <TransactionStatusLabel />
                  </TransactionStatus>
                  <TransactionToast className="mb-4">
                    <TransactionToastIcon />
                    <TransactionToastLabel />
                    <TransactionToastAction />
                  </TransactionToast>
                </Transaction>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
        >
          ← Back to Welcome
        </Button>
      </div>
    </div>
  );
}