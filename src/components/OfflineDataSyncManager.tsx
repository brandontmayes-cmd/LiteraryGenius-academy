import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfflineDataSync } from '@/hooks/useOfflineDataSync';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Database,
  RotateCcw
} from 'lucide-react';

export const OfflineDataSyncManager: React.FC = () => {
  const { syncStatus, conflicts, syncData, resolveConflict } = useOfflineDataSync();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
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
    if (syncStatus.syncErrors.length > 0) return 'Sync Error';
    if (syncStatus.pendingItems > 0) return 'Pending Sync';
    return 'Synced';
  };

  return (
    <div className="space-y-4">
      {/* Sync Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {syncStatus.isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <CardTitle className="text-lg">Data Sync Status</CardTitle>
            </div>
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
          <CardDescription>
            Offline data synchronization and conflict management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Pending Items</p>
                <p className="text-2xl font-bold">{syncStatus.pendingItems}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-sm text-muted-foreground">
                  {formatLastSync(syncStatus.lastSyncTime)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Conflicts</p>
                <p className="text-2xl font-bold">{conflicts.length}</p>
              </div>
            </div>
          </div>

          {syncStatus.isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Synchronizing data...</span>
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={syncData}
              disabled={syncStatus.isSyncing || !syncStatus.isOnline}
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Errors */}
      {syncStatus.syncErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Sync Errors:</p>
              {syncStatus.syncErrors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Data Conflicts ({conflicts.length})</span>
            </CardTitle>
            <CardDescription>
              Resolve conflicts between local and server data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">
                    {conflict.type} Conflict
                  </h4>
                  <Badge variant="outline">
                    {conflict.conflictFields.length} fields
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Conflicting fields: {conflict.conflictFields.join(', ')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Local Version</h5>
                    <div className="bg-blue-50 p-3 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(conflict.localData, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Server Version</h5>
                    <div className="bg-green-50 p-3 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(conflict.serverData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(conflict.id, 'local')}
                  >
                    Use Local
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(conflict.id, 'server')}
                  >
                    Use Server
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveConflict(conflict.id, 'merge')}
                  >
                    Merge Both
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {syncStatus.isOnline && !syncStatus.isSyncing && syncStatus.pendingItems === 0 && conflicts.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All data is synchronized and up to date.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};