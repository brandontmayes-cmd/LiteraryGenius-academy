import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { indexedDBService, OfflineAssignment, OfflineSubmission, SyncQueueItem } from '../lib/indexedDB';
import { useAuth } from '../contexts/AuthContext';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: number;
  lastSyncTime: Date | null;
  syncProgress: number;
  errors: string[];
}

export function useOfflineSync() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingItems: 0,
    lastSyncTime: null,
    syncProgress: 0,
    errors: []
  });

  // Initialize IndexedDB
  useEffect(() => {
    indexedDBService.init().catch(console.error);
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncPendingItems();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync assignments from server to local storage
  const syncAssignmentsFromServer = useCallback(async () => {
    if (!syncStatus.isOnline) return;

    try {
      const { data: serverAssignments, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Save to IndexedDB
      for (const assignment of serverAssignments || []) {
        const offlineAssignment: OfflineAssignment = {
          ...assignment,
          synced: true,
          last_modified: new Date().toISOString()
        };
        await indexedDBService.saveAssignment(offlineAssignment);
      }
    } catch (error) {
      console.error('Failed to sync assignments from server:', error);
    }
  }, [syncStatus.isOnline]);

  // Sync submissions from server to local storage
  const syncSubmissionsFromServer = useCallback(async () => {
    if (!syncStatus.isOnline || !user?.id) return;

    try {
      const { data: serverSubmissions, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Save to IndexedDB
      for (const submission of serverSubmissions || []) {
        const offlineSubmission: OfflineSubmission = {
          ...submission,
          synced: true,
          last_modified: new Date().toISOString()
        };
        await indexedDBService.saveSubmission(offlineSubmission);
      }
    } catch (error) {
      console.error('Failed to sync submissions from server:', error);
    }
  }, [syncStatus.isOnline, user?.id]);

  // Sync pending items to server
  const syncPendingItems = useCallback(async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0, errors: [] }));

    try {
      const syncQueue = await indexedDBService.getSyncQueue();
      const totalItems = syncQueue.length;

      if (totalItems === 0) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false, 
          pendingItems: 0,
          lastSyncTime: new Date()
        }));
        return;
      }

      const errors: string[] = [];
      let processedItems = 0;

      for (const item of syncQueue) {
        try {
          await processSyncItem(item);
          await indexedDBService.removeFromSyncQueue(item.id);
          processedItems++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${item.type} ${item.action}: ${errorMessage}`);
          
          // Update retry count
          if (item.retries < 3) {
            await indexedDBService.addToSyncQueue({
              ...item,
              retries: item.retries + 1,
              error: errorMessage
            });
          }
        }

        setSyncStatus(prev => ({ 
          ...prev, 
          syncProgress: (processedItems / totalItems) * 100 
        }));
      }

      const remainingQueue = await indexedDBService.getSyncQueue();
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false, 
        pendingItems: remainingQueue.length,
        lastSyncTime: new Date(),
        errors
      }));

    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Sync failed']
      }));
    }
  }, [syncStatus.isOnline, syncStatus.isSyncing]);

  // Process individual sync item
  const processSyncItem = async (item: SyncQueueItem) => {
    switch (item.type) {
      case 'submission':
        if (item.action === 'create') {
          const { error } = await supabase
            .from('assignment_submissions')
            .insert(item.data);
          if (error) throw error;
          
          // Update local record as synced
          await indexedDBService.saveSubmission({
            ...item.data,
            synced: true,
            last_modified: new Date().toISOString()
          });
        } else if (item.action === 'update') {
          const { error } = await supabase
            .from('assignment_submissions')
            .update(item.data)
            .eq('id', item.data.id);
          if (error) throw error;
          
          // Update local record as synced
          await indexedDBService.saveSubmission({
            ...item.data,
            synced: true,
            last_modified: new Date().toISOString()
          });
        }
        break;
      
      case 'assignment':
        // Handle assignment sync if needed
        break;
    }
  };

  // Save assignment offline
  const saveAssignmentOffline = useCallback(async (assignment: any) => {
    const offlineAssignment: OfflineAssignment = {
      ...assignment,
      synced: false,
      last_modified: new Date().toISOString()
    };

    await indexedDBService.saveAssignment(offlineAssignment);

    if (syncStatus.isOnline) {
      await indexedDBService.addToSyncQueue({
        type: 'assignment',
        action: 'create',
        data: assignment
      });
      syncPendingItems();
    }
  }, [syncStatus.isOnline, syncPendingItems]);

  // Save submission offline
  const saveSubmissionOffline = useCallback(async (submission: any) => {
    const offlineSubmission: OfflineSubmission = {
      ...submission,
      id: submission.id || crypto.randomUUID(),
      synced: false,
      last_modified: new Date().toISOString(),
      offline_created: !submission.id
    };

    await indexedDBService.saveSubmission(offlineSubmission);

    if (syncStatus.isOnline) {
      await indexedDBService.addToSyncQueue({
        type: 'submission',
        action: submission.id ? 'update' : 'create',
        data: offlineSubmission
      });
      syncPendingItems();
    } else {
      // Update pending items count
      const queue = await indexedDBService.getSyncQueue();
      setSyncStatus(prev => ({ ...prev, pendingItems: queue.length + 1 }));
    }
  }, [syncStatus.isOnline, syncPendingItems]);

  // Get offline assignments
  const getOfflineAssignments = useCallback(async () => {
    return await indexedDBService.getAssignments();
  }, []);

  // Get offline submissions
  const getOfflineSubmissions = useCallback(async (studentId?: string) => {
    return await indexedDBService.getSubmissions(studentId);
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    if (syncStatus.isOnline) {
      await syncAssignmentsFromServer();
      await syncSubmissionsFromServer();
      await syncPendingItems();
    }
  }, [syncAssignmentsFromServer, syncSubmissionsFromServer, syncPendingItems]);

  // Update pending items count on mount
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const queue = await indexedDBService.getSyncQueue();
        setSyncStatus(prev => ({ ...prev, pendingItems: queue.length }));
      } catch (error) {
        console.error('Failed to get pending items count:', error);
      }
    };

    updatePendingCount();
  }, []);

  return {
    syncStatus,
    saveAssignmentOffline,
    saveSubmissionOffline,
    getOfflineAssignments,
    getOfflineSubmissions,
    forceSync,
    syncPendingItems
  };
}