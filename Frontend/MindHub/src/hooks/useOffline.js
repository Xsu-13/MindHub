export const useOffline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const dbRef = useRef();

    useEffect(() => {
        const init = async () => {
            dbRef.current = await initDB();
        };
        init();

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const saveToQueue = async (action) => {
        return new Promise((resolve) => {
            const transaction = dbRef.current.transaction([STORES.QUEUE], 'readwrite');
            const store = transaction.objectStore(STORES.QUEUE);
            store.add(action).onsuccess = () => resolve();
        });
    };

    const processQueue = async () => {
        const actions = await getAllFromQueue();
        for (const action of actions) {
            try {
                await api.syncAction(action);
                await removeFromQueue(action.id);
            } catch (error) {
                console.error('Sync failed:', error);
                break;
            }
        }
    };

    return { isOnline, saveToQueue, processQueue };
};