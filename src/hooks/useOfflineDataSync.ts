import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { indexedDBService, OfflineAssignment, OfflineSubmission, SyncQueueItem } from '@/lib/indexedDB';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  syncErrors: string[];
}

interface ConflictItem {
  id: string;
  type: 'assignment' | 'submission';
  localData: any;
  serverData: any;
  conflictFields: string[];
}

export const useOfflineDataSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    syncErrors: []
  });
  
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncData();
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

  // Check for pending sync items
  const updatePendingCount = useCallback(async () => {
    try {
      const queue = await indexedDBService.getSyncQueue();
      setSyncStatus(prev => ({ ...prev, pendingItems: queue.length }));
    } catch (error) {
      console.error('Error checking pending items:', error);
    }
  }, []);

  // Sync data when online
  const syncData = useCallback(async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    try {
      await indexedDBService.init();
      const queue = await indexedDBService.getSyncQueue();
      const errors: string[] = [];
      const detectedConflicts: ConflictItem[] = [];

      for (const item of queue) {
        try {
          if (item.type === 'assignment') {
            await syncAssignment(item, detectedConflicts);
          } else if (item.type === 'submission') {
            await syncSubmission(item, detectedConflicts);
          }
          
          await indexedDBService.removeFromSyncQueue(item.id);
        } catch (error) {
          errors.push(`Failed to sync ${item.type}: ${error}`);
          console.error('Sync error:', error);
        }
      }

      // Download latest data from server
      await downloadServerData();

      setConflicts(detectedConflicts);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        syncErrors: errors
      }));
      
      await updatePendingCount();
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [`Sync failed: ${error}`]
      }));
    }
  }, [syncStatus.isOnline, syncStatus.isSyncing]);

  const syncAssignment = async (item: SyncQueueItem, conflicts: ConflictItem[]) => {
    const { data: serverData, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', item.data.id)
      .single();

    if (item.action === 'create') {
      if (serverData) {
        // Conflict: assignment exists on server
        conflicts.push({
          id: item.data.id,
          type: 'assignment',
          localData: item.data,
          serverData,
          conflictFields: ['title', 'description', 'due_date']
        });
      } else {
        await supabase.from('assignments').insert(item.data);
      }
    } else if (item.action === 'update') {
      if (serverData && new Date(serverData.updated_at) > new Date(item.data.last_modified)) {
        // Server has newer version
        conflicts.push({
          id: item.data.id,
          type: 'assignment',
          localData: item.data,
          serverData,
          conflictFields: detectChangedFields(item.data, serverData)
        });
      } else {
        await supabase.from('assignments').update(item.data).eq('id', item.data.id);
      }
    }
  };

  const syncSubmission = async (item: SyncQueueItem, conflicts: ConflictItem[]) => {
    const { data: serverData } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('id', item.data.id)
      .single();

    if (item.action === 'create') {
      if (serverData) {
        conflicts.push({
          id: item.data.id,
          type: 'submission',
          localData: item.data,
          serverData,
          conflictFields: ['answers', 'submitted_at']
        });
      } else {
        await supabase.from('assignment_submissions').insert(item.data);
      }
    } else if (item.action === 'update') {
      if (serverData && new Date(serverData.updated_at) > new Date(item.data.last_modified)) {
        conflicts.push({
          id: item.data.id,
          type: 'submission',
          localData: item.data,
          serverData,
          conflictFields: detectChangedFields(item.data, serverData)
        });
      } else {
        await supabase.from('assignment_submissions').update(item.data).eq('id', item.data.id);
      }
    }
  };

  const downloadServerData = async () => {
    // Download assignments
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (assignments) {
      for (const assignment of assignments) {
        await indexedDBService.saveAssignment({
          ...assignment,
          synced: true,
          last_modified: assignment.updated_at || assignment.created_at
        });
      }
    }

    // Download submissions for current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (submissions) {
        for (const submission of submissions) {
          await indexedDBService.saveSubmission({
            ...submission,
            synced: true,
            last_modified: submission.updated_at || submission.created_at
          });
        }
      }
    }
  };

  const detectChangedFields = (local: any, server: any): string[] => {
    const fields = [];
    const compareFields = ['title', 'description', 'answers', 'grade', 'feedback'];
    
    for (const field of compareFields) {
      if (local[field] !== server[field]) {
        fields.push(field);
      }
    }
    
    return fields;
  };

  const resolveConflict = useCallback(async (conflictId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    try {
      let finalData;
      
      switch (resolution) {
        case 'local':
          finalData = conflict.localData;
          break;
        case 'server':
          finalData = conflict.serverData;
          break;
        case 'merge':
          finalData = mergedData || { ...conflict.serverData, ...conflict.localData };
          break;
      }

      // Update server
      if (conflict.type === 'assignment') {
        await supabase.from('assignments').upsert(finalData);
        await indexedDBService.saveAssignment({ ...finalData, synced: true });
      } else {
        await supabase.from('assignment_submissions').upsert(finalData);
        await indexedDBService.saveSubmission({ ...finalData, synced: true });
      }

      // Remove conflict
      setConflicts(prev => prev.filter(c => c.id !== conflictId));
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  }, [conflicts]);

  const saveOfflineData = useCallback(async (type: 'assignment' | 'submission', data: any, action: 'create' | 'update' = 'create') => {
    try {
      await indexedDBService.init();
      
      if (type === 'assignment') {
        await indexedDBService.saveAssignment({ ...data, synced: false });
      } else {
        await indexedDBService.saveSubmission({ ...data, synced: false });
      }

      // Add to sync queue
      await indexedDBService.addToSyncQueue({
        type,
        action,
        data
      });

      await updatePendingCount();

      // Try to sync immediately if online
      if (syncStatus.isOnline) {
        syncData();
      }
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  }, [syncStatus.isOnline, syncData]);

  const getOfflineData = useCallback(async (type: 'assignments' | 'submissions', studentId?: string) => {
    try {
      await indexedDBService.init();
      
      if (type === 'assignments') {
        return await indexedDBService.getAssignments();
      } else {
        return await indexedDBService.getSubmissions(studentId);
      }
    } catch (error) {
      console.error('Error getting offline data:', error);
      return [];
    }
  }, []);

  // Initialize and check for pending items
  useEffect(() => {
    updatePendingCount();
    
    // Auto-sync on mount if online
    if (syncStatus.isOnline) {
      syncData();
    }
  }, []);

  return {
    syncStatus,
    conflicts,
    syncData,
    resolveConflict,
    saveOfflineData,
    getOfflineData,
    updatePendingCount
  };
};