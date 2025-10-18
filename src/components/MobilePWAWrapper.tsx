import React, { useEffect } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';
import { PullToRefreshIndicator } from './PullToRefreshIndicator';
import { usePWA } from '../hooks/usePWA';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface MobilePWAWrapperProps {
  children: React.ReactNode;
}

export const MobilePWAWrapper: React.FC<MobilePWAWrapperProps> = ({ children }) => {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const { isOnline, syncStatus } = useOfflineSync();
  const { isRefreshing, pullToRefresh } = usePullToRefresh(() => {
    window.location.reload();
  });

  return (
    <div className="mobile-pwa-wrapper">
      {/* PWA Install Prompt */}
      {isInstallable && !isInstalled && <PWAInstallPrompt onInstall={promptInstall} />}
      
      {/* Offline Sync Indicator */}
      <OfflineSyncIndicator isOnline={isOnline} syncStatus={syncStatus} />
      
      {/* Pull to Refresh Indicator */}
      {isRefreshing && <PullToRefreshIndicator />}
      
      {/* Main Content */}
      {children}
    </div>
  );
};
