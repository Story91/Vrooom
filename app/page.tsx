"use client";

import {
  useMiniKit,
  useAddFrame,
  useViewProfile,
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
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { GameManager } from "./components/racing/GameManager";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);

  const addFrame = useAddFrame();
  const viewProfile = useViewProfile();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleViewProfile = useCallback(() => {
    viewProfile();
  }, [viewProfile]);

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

  return (
    <div className="flex flex-col h-screen font-sans text-[var(--app-foreground)] bg-gradient-to-br from-[var(--app-background)] via-[var(--app-background)] to-[var(--app-gray)]">
      {/* Header - Compact for mini app */}
      <header className="flex justify-between items-center px-4 py-2 h-14 bg-[var(--app-card-bg)] border-b border-[var(--app-card-border)] backdrop-blur-sm bg-opacity-95">
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
        
        <div className="flex items-center space-x-2">
          {/* Profile Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewProfile}
            className="text-[var(--app-accent)] p-2"
          >
            <span className="text-sm">PROFILE</span>
          </Button>
          
          {/* Save Frame Button */}
          {saveFrameButton}
        </div>
      </header>

      {/* Main Game Area - Full Height */}
      <main className="flex-1 overflow-hidden">
        <GameManager />
      </main>

      {/* Debug Footer - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <footer className="px-4 py-2 bg-gray-100 border-t text-xs text-gray-600">
          <div className="flex justify-between">
            <span>FID: {context?.user?.fid || 'None'}</span>
            <span>Added: {context?.client?.added ? 'Yes' : 'No'}</span>
            <span>Location: {String(context?.location) || 'Unknown'}</span>
          </div>
        </footer>
      )}
    </div>
  );
}
