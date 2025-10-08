import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOfflineDataSync } from '@/hooks/useOfflineDataSync';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Database
} from 'lucide-react';

interface OfflineSyncIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({ 
  showDetails = false, 
  compact = false 
}) => {
  const { syncStatus, syncData } = useOfflineDataSync();

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    
    if (syncStatus.isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    
    if (syncStatus.syncErrors.length > 0) {
      return <AlertCircle className="h-4 w-4" />;
    }
    
    if (syncStatus.pendingItems > 0) {
      return <Clock className="h-4 w-4" />;
    }
    
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'destructive';
    if (syncStatus.isSyncing) return 'default';
    if (syncStatus.syncErrors.length > 0) return 'destructive';
    if (syncStatus.pendingItems > 0) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.syncErrors.length > 0) return 'Sync Failed';
    if (syncStatus.pendingItems > 0) return `${syncStatus.pendingItems} Pending`;
    return 'Synced';
  };

  const getTooltipContent = () => {
    const lastSync = syncStatus.lastSyncTime 
      ? syncStatus.lastSyncTime.toLocaleString()
      : 'Never synced';
    
    return (
      <div className="space-y-1">
        <p className="font-medium">{getStatusText()}</p>
        <p className="text-xs">Last sync: {lastSync}</p>
        {syncStatus.pendingItems > 0 && (
          <p className="text-xs">{syncStatus.pendingItems} items waiting to sync</p>
        )}
        {syncStatus.syncErrors.length > 0 && (
          <p className="text-xs text-red-400">
            {syncStatus.syncErrors.length} sync errors
          </p>
        )}
        {syncStatus.isOnline && (
          <p className="text-xs text-muted-foreground">Click to sync now</p>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={syncStatus.isOnline ? syncData : undefined}
              disabled={syncStatus.isSyncing}
              className="h-8 w-8 p-0"
            >
              {getStatusIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {getTooltipContent()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getStatusColor()}
              className="cursor-pointer"
              onClick={syncStatus.isOnline ? syncData : undefined}
            >
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {getTooltipContent()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showDetails && (
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {syncStatus.pendingItems > 0 && (
            <div className="flex items-center space-x-1">
              <Database className="h-3 w-3" />
              <span>{syncStatus.pendingItems} pending</span>
            </div>
          )}
          
          {syncStatus.lastSyncTime && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};