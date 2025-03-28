
import { debounce } from './performanceMonitor';

// Define our types
interface StorageMessage {
  type: 'SAVE' | 'LOAD' | 'DELETE';
  key?: string;
  data?: any;
  batch?: Record<string, any>;
}

interface StorageResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestType?: string;
}

// Create a class to manage worker operations with fallbacks
class StorageWorkerManager {
  private worker: Worker | null = null;
  private fallbackMode = false;
  private pendingOperations: Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = new Map();
  private operationCounter = 0;
  private debouncedBatch: Record<string, any> = {};
  private isBatchScheduled = false;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      // Create the worker
      const workerBlob = new Blob(
        [`importScripts('${window.location.origin}/src/utils/adminStorageWorker.ts');`],
        { type: 'application/javascript' }
      );
      
      this.worker = new Worker(URL.createObjectURL(workerBlob));
      
      // Set up message handler
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
      
      console.log('Storage worker initialized successfully');
    } catch (error) {
      console.warn('Web Worker not supported, falling back to main thread:', error);
      this.fallbackMode = true;
    }
  }

  private handleWorkerMessage(event: MessageEvent<StorageResponse>) {
    const { success, data, error, requestType } = event.data;
    
    // Find the promise resolver for this operation
    const operationId = `${requestType}-${this.operationCounter}`;
    const pendingOp = this.pendingOperations.get(operationId);
    
    if (pendingOp) {
      if (success) {
        pendingOp.resolve(data);
      } else {
        pendingOp.reject(new Error(error));
      }
      this.pendingOperations.delete(operationId);
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error event:', error);
    // Fall back to main thread on worker error
    this.terminateWorker();
    this.fallbackMode = true;
  }

  private terminateWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  // Fallback for saving data when worker is not available
  private fallbackSave(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Fallback for loading data when worker is not available
  private fallbackLoad(key: string): Promise<any> {
    return new Promise((resolve) => {
      const data = localStorage.getItem(key);
      resolve(data ? JSON.parse(data) : null);
    });
  }

  // Fallback for deleting data when worker is not available
  private fallbackDelete(key: string): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem(key);
      resolve();
    });
  }

  // Fallback for batch operations
  private fallbackBatch(batch: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        for (const [key, value] of Object.entries(batch)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Save data to storage (either through worker or fallback)
  public async save(key: string, data: any): Promise<void> {
    if (this.fallbackMode) {
      return this.fallbackSave(key, data);
    }

    this.operationCounter++;
    const operationId = `SAVE-${this.operationCounter}`;
    
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(operationId, { resolve, reject });
      this.worker?.postMessage({ type: 'SAVE', key, data });
    });
  }

  // Load data from storage
  public async load(key: string): Promise<any> {
    if (this.fallbackMode) {
      return this.fallbackLoad(key);
    }

    this.operationCounter++;
    const operationId = `LOAD-${this.operationCounter}`;
    
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(operationId, { resolve, reject });
      this.worker?.postMessage({ type: 'LOAD', key });
    });
  }

  // Delete data from storage
  public async delete(key: string): Promise<void> {
    if (this.fallbackMode) {
      return this.fallbackDelete(key);
    }

    this.operationCounter++;
    const operationId = `DELETE-${this.operationCounter}`;
    
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(operationId, { resolve, reject });
      this.worker?.postMessage({ type: 'DELETE', key });
    });
  }

  // Queue an item for batch saving
  public queueForBatch(key: string, data: any): void {
    this.debouncedBatch[key] = data;
    
    if (!this.isBatchScheduled) {
      this.isBatchScheduled = true;
      this.processBatchQueue();
    }
  }

  // Process the batch queue with debouncing
  private processBatchQueue = debounce(() => {
    if (Object.keys(this.debouncedBatch).length === 0) {
      this.isBatchScheduled = false;
      return;
    }
    
    const batchToProcess = { ...this.debouncedBatch };
    this.debouncedBatch = {};
    
    if (this.fallbackMode) {
      this.fallbackBatch(batchToProcess)
        .then(() => {
          console.log('Batch save completed (fallback mode)');
          this.isBatchScheduled = false;
        })
        .catch(error => {
          console.error('Batch save failed (fallback mode):', error);
          this.isBatchScheduled = false;
        });
      return;
    }
    
    this.operationCounter++;
    const operationId = `SAVE-${this.operationCounter}`;
    
    new Promise<void>((resolve, reject) => {
      this.pendingOperations.set(operationId, { resolve, reject });
      this.worker?.postMessage({ type: 'SAVE', batch: batchToProcess });
    })
      .then(() => {
        console.log('Batch save completed (worker mode)');
        this.isBatchScheduled = false;
      })
      .catch(error => {
        console.error('Batch save failed (worker mode):', error);
        this.isBatchScheduled = false;
      });
  }, 300);

  // Force immediate processing of the batch queue
  public async flushBatchQueue(): Promise<void> {
    if (Object.keys(this.debouncedBatch).length === 0) {
      return;
    }
    
    const batchToProcess = { ...this.debouncedBatch };
    this.debouncedBatch = {};
    this.isBatchScheduled = false;
    
    if (this.fallbackMode) {
      return this.fallbackBatch(batchToProcess);
    }
    
    this.operationCounter++;
    const operationId = `SAVE-${this.operationCounter}`;
    
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(operationId, { resolve, reject });
      this.worker?.postMessage({ type: 'SAVE', batch: batchToProcess });
    });
  }

  // Clean up resources
  public cleanup() {
    this.terminateWorker();
    this.pendingOperations.clear();
  }
}

// Create and export a singleton instance
export const storageWorker = new StorageWorkerManager();
