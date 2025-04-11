export const offlineApi = {
    updateNode: async (node, online) => {
        if (online) {
            return api.updateNode(node);
        } else {
            await localDB.saveNode(node);
            await localDB.addToSyncQueue({
                type: 'UPDATE_NODE',
                payload: node,
                timestamp: Date.now()
            });
            return { success: true, offline: true };
        }
    },
    // Аналогично для других методов
};