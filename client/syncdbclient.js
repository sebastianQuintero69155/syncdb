const syncdb = {
    register: (socket, registerData, authInfo) => {
        socket.emit('register', { registerData, authInfo });
    },
    send: async (socket, groupId, collectionsWithName) => {
        if (!socket.connected) throw 'Socket not connected'

        const dataToSyncPromises = collectionsWithName.map(
            ({ collection }) => collection.find({ synced: false }).select('-synced -_id')
        );

        const dataToUpdatePromises = collectionsWithName.map(
            ({ collection }) => collection.find({ synced: false }).select('-synced -_id')
        );

        const dataToSyncByCollections = await Promise.all(dataToSyncPromises);
        const dataToUpdateByCollections = await Promise.all(dataToUpdatePromises);
        
        dataToSyncByCollections.forEach(async (documents, index) => {
            changeSyncState = documents.map(async (document, secIndex) => {
                const { name, collection } = collectionsWithName[index];
                const { _id } = dataToUpdateByCollections[index][secIndex];
                socket.emit('sync', { name, document, groupId });
                // document.synced = true;
                await collection.updateOne({ _id }, document);
            });
        });
    }
}

module.exports = syncdb;