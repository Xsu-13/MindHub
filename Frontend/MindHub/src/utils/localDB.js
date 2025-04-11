const DB_NAME = 'MindMapOfflineDB';
const DB_VERSION = 1;
const STORES = {
    MAPS: 'maps',
    NODES: 'nodes',
    QUEUE: 'sync_queue'
};

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORES.MAPS)) {
                db.createObjectStore(STORES.MAPS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.NODES)) {
                db.createObjectStore(STORES.NODES, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.QUEUE)) {
                const queueStore = db.createObjectStore(STORES.QUEUE, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                queueStore.createIndex('actionType', 'actionType', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const addItem = (db, storeName, item) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getItem = (db, storeName, id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getAllItems = (db, storeName) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};