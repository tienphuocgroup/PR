import { PaymentRequest } from '../types';

const FORM_DATA_KEY = 'paymentRequestFormData';
const STORAGE_VERSION = '1.0';

interface StoragePayload {
  version: string;
  timestamp: number;
  data: Partial<PaymentRequest>;
  expires?: number;
}

export const secureFormStorage = {
  save: (data: PaymentRequest): void => {
    try {
      const payload: StoragePayload = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data: { ...data }
      };
      
      // Remove sensitive file data before storing
      delete payload.data.attachments;
      
      // Use sessionStorage for temporary data (cleared when browser closes)
      const storageData = JSON.stringify(payload);
      sessionStorage.setItem(FORM_DATA_KEY, storageData);
      
      // Optional: Also save to localStorage with expiration for persistence
      const expires = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      const backupPayload = { ...payload, expires };
      localStorage.setItem(`${FORM_DATA_KEY}_backup`, JSON.stringify(backupPayload));
      
      console.log('Form data saved successfully');
    } catch (error) {
      console.error('Error saving form data:', error);
      // Don't throw error to avoid breaking user experience
    }
  },
  
  load: (): Partial<PaymentRequest> | null => {
    try {
      // Try sessionStorage first (more secure, temporary)
      let storageData = sessionStorage.getItem(FORM_DATA_KEY);
      
      // Fallback to localStorage backup if sessionStorage is empty
      if (!storageData) {
        const backupData = localStorage.getItem(`${FORM_DATA_KEY}_backup`);
        if (backupData) {
          const parsed: StoragePayload = JSON.parse(backupData);
          // Check if backup has expired
          if (parsed.expires && Date.now() < parsed.expires) {
            storageData = JSON.stringify(parsed);
          } else {
            // Remove expired backup
            localStorage.removeItem(`${FORM_DATA_KEY}_backup`);
          }
        }
      }
      
      if (!storageData) return null;
      
      const payload: StoragePayload = JSON.parse(storageData);
      
      // Version check for future compatibility
      if (payload.version !== STORAGE_VERSION) {
        console.warn('Storage version mismatch, clearing data');
        this.clear();
        return null;
      }
      
      // Check if data is too old (older than 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (Date.now() - payload.timestamp > maxAge) {
        console.info('Stored data is too old, clearing');
        this.clear();
        return null;
      }
      
      return payload.data;
    } catch (error) {
      console.error('Error loading form data:', error);
      // Clear corrupted data
      this.clear();
      return null;
    }
  },
  
  clear: (): void => {
    try {
      sessionStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(`${FORM_DATA_KEY}_backup`);
      console.log('Form data cleared');
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  },
  
  // Get storage info for debugging
  getStorageInfo: (): { hasSessionData: boolean; hasBackupData: boolean; backupExpires?: Date } => {
    const hasSessionData = !!sessionStorage.getItem(FORM_DATA_KEY);
    const backupData = localStorage.getItem(`${FORM_DATA_KEY}_backup`);
    
    if (!backupData) {
      return { hasSessionData, hasBackupData: false };
    }
    
    try {
      const parsed: StoragePayload = JSON.parse(backupData);
      return {
        hasSessionData,
        hasBackupData: true,
        backupExpires: parsed.expires ? new Date(parsed.expires) : undefined
      };
    } catch {
      return { hasSessionData, hasBackupData: false };
    }
  }
};