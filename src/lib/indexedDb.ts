// @ts-nocheck
import { Question } from '../types';

const DB_NAME = 'MockTestQuizDB';
const STORE_NAME = 'questions';
const DB_VERSION = 1;

export function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function getCachedQuestions(): Promise<Question[]> {
  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as Question[];
        if (result && result.length > 0) {
          resolve(result);
        } else {
          // If IndexedDB is empty, try localStorage backup fallback
          const localQs = localStorage.getItem('MOCK_LOCAL_QUESTIONS_BACKUP');
          if (localQs) {
            try {
              resolve(JSON.parse(localQs));
              return;
            } catch (e) {}
          }
          resolve([]);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to read from IndexedDB:", error);
    const localQs = localStorage.getItem('MOCK_LOCAL_QUESTIONS_BACKUP');
    if (localQs) {
      try {
        return JSON.parse(localQs);
      } catch (e) {}
    }
    return [];
  }
}

export async function saveQuestionsToIndexedDB(questions: Question[]): Promise<void> {
  // Save to localStorage backup first as a fail-safe
  try {
    const serialized = JSON.stringify(questions);
    if (serialized.length < 3500000) { // Limit to 3.5MB to be safe
      localStorage.setItem('MOCK_LOCAL_QUESTIONS_BACKUP', serialized);
      console.log(`✓ Saved backup of ${questions.length} questions to localStorage.`);
    }
  } catch (e) {
    console.warn("Failed to write to localStorage backup (possibly quota exceeded):", e);
  }

  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      questions.forEach((q) => {
        store.put(q);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to save to IndexedDB:", error);
  }
}

export async function deleteQuestionFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to delete from IndexedDB:", error);
  }
}

export async function clearQuestionsIndexedDB(): Promise<void> {
  try {
    localStorage.removeItem('MOCK_LOCAL_QUESTIONS_BACKUP');
  } catch (e) {}

  try {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to clear IndexedDB:", error);
  }
}
