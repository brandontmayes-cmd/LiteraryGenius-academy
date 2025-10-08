// IndexedDB wrapper for offline data storage
export interface OfflineAssignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  created_at: string;
  questions?: any[];
  max_score?: number;
  synced: boolean;
  last_modified: string;
}

export interface OfflineSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  answers: any;
  file_urls?: string[];
  submitted_at: string;
  grade?: number;
  feedback?: string;
  auto_graded: boolean;
  synced: boolean;
  last_modified: string;
  offline_created?: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'assignment' | 'submission';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retries: number;
  error?: string;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'LiteraryGeniusOfflineDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Assignments store
        if (!db.objectStoreNames.contains('assignments')) {
          const assignmentStore = db.createObjectStore('assignments', { keyPath: 'id' });
          assignmentStore.createIndex('subject', 'subject', { unique: false });
          assignmentStore.createIndex('due_date', 'due_date', { unique: false });
          assignmentStore.createIndex('synced', 'synced', { unique: false });
        }

        // Submissions store
        if (!db.objectStoreNames.contains('submissions')) {
          const submissionStore = db.createObjectStore('submissions', { keyPath: 'id' });
          submissionStore.createIndex('assignment_id', 'assignment_id', { unique: false });
          submissionStore.createIndex('student_id', 'student_id', { unique: false });
          submissionStore.createIndex('synced', 'synced', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Assignment operations
  async saveAssignment(assignment: OfflineAssignment): Promise<void> {
    if (!this.db) {
      console.warn('IndexedDB not initialized, skipping save');
      return;
    }
    
    const transaction = this.db.transaction(['assignments'], 'readwrite');
    const store = transaction.objectStore('assignments');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...assignment,
        last_modified: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }


  async getAssignments(): Promise<OfflineAssignment[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['assignments'], 'readonly');
    const store = transaction.objectStore('assignments');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSubmission(submission: OfflineSubmission): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['submissions'], 'readwrite');
    const store = transaction.objectStore('submissions');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...submission,
        last_modified: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSubmissions(studentId?: string): Promise<OfflineSubmission[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['submissions'], 'readonly');
    const store = transaction.objectStore('submissions');
    
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      if (studentId) {
        const index = store.index('student_id');
        request = index.getAll(studentId);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retries: 0
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) return [];
    
    const transaction = this.db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }


  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['assignments', 'submissions', 'syncQueue'], 'readwrite');
    
    const promises = [
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('assignments').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('submissions').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('syncQueue').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ];
    
    await Promise.all(promises);
  }
}

export const indexedDBService = new IndexedDBService();
