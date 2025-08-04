"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
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
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { RacingGame } from "./components/RacingGame";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const { address } = useAccount();

  const addFrame = useAddFrame();
  const sendNotification = useNotification();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-2"
          icon={<Icon name="plus" size="sm" />}
        >
          Save
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-xs font-medium text-[#0052FF]">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  // Transaction call - sending 0 ETH to self
  const calls = useMemo(() => address
    ? [
        {
          to: address,
          data: "0x" as `0x${string}`,
          value: BigInt(0),
        },
      ]
    : [], [address]);

  const handleTransactionSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;
    
    console.log(`Racing transaction successful: ${transactionHash}`);

    await sendNotification({
      title: "🏁 Transaction Complete!",
      body: `You successfully completed a racing transaction! ${transactionHash.slice(0, 10)}...`,
    });
  }, [sendNotification]);

  return (
    <div className="flex flex-col h-screen font-sans text-[var(--app-foreground)] bg-gradient-to-br from-[var(--app-background)] via-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 h-12 px-4 shrink-0">
          <div className="flex items-center space-x-2">
            <Wallet className="z-10">
              <ConnectWallet>
                <Name className="text-inherit text-sm" />
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
          </div>
          <div>{saveFrameButton}</div>
        </header>

        {/* Main Game */}
        <main className="flex-1 relative">
          <RacingGame />
        </main>

        {/* Transaction Footer */}
        <footer className="mt-4 pt-4 px-4 shrink-0">
          {address ? (
            <Transaction
              calls={calls}
              onSuccess={handleTransactionSuccess}
              onError={(error: TransactionError) =>
                console.error("Transaction failed:", error)
              }
            >
              <TransactionButton className="w-full text-white text-sm bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] rounded-lg py-3" />
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
          ) : (
            <div className="text-center py-3 text-[var(--app-foreground-muted)] text-sm">
              Connect wallet to make transactions
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
