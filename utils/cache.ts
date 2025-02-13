// Environment variables with type safety
const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME!;
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME!;
const DB_VERSION = Number(process.env.NEXT_PUBLIC_DB_VERSION) || 1;
const CACHE_EXPIRY = Number(process.env.NEXT_PUBLIC_CACHE_EXPIRY) || 86400000;

interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Initialize IndexedDB
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Compress data before storing
function compressData<T>(data: T): string {
  try {
    if (!data) {
      console.error("Invalid data provided to compress");
      return "";
    }

    const stringData = JSON.stringify(data);
    if (!stringData) {
      console.error("Failed to stringify data");
      return "";
    }

    return stringData; // No need for compression with IndexedDB
  } catch (error) {
    console.error("Error compressing data:", error);
    return "";
  }
}

// Decompress data after retrieval
function decompressData<T>(data: string): T | null {
  try {
    if (!data) {
      console.error("No data provided");
      return null;
    }

    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Error decompressing data:", error);
    return null;
  }
}

// Generic function to get data from cache
export async function getFromCache<T>(
  key: string = STORE_NAME
): Promise<T | null> {
  if (typeof window === "undefined") return null;

  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        console.error("Error reading from cache:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const cachedData = request.result as CacheData<string> | undefined;

        if (!cachedData || !cachedData.data || !cachedData.timestamp) {
          resolve(null);
          return;
        }

        const now = Date.now();
        if (now - cachedData.timestamp > CACHE_EXPIRY) {
          // Cache expired
          clearCache(key);
          resolve(null);
          return;
        }

        const decompressed = decompressData<T>(cachedData.data);
        resolve(decompressed);
      };
    });
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

// Generic function to set data in cache
export async function setInCache<T>(
  data: T,
  key: string = STORE_NAME
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (!data) {
      console.error("Attempting to cache null/undefined data");
      return;
    }

    const compressed = compressData<T>(data);
    if (!compressed) {
      console.error("Failed to compress data");
      return;
    }

    const cacheData: CacheData<string> = {
      data: compressed,
      timestamp: Date.now(),
    };

    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cacheData, key);

      request.onerror = () => {
        console.error("Error setting cache:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error setting cache:", error);
  }
}

// Function to clear cache
export async function clearCache(key: string = STORE_NAME): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}
