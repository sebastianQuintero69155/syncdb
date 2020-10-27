const express = require('express');
const SocketIO = require('socket.io');

const Device = require('./db/schemas/Device');

const Test = require('./db/schemas/Test');
const Other = require('./db/schemas/Other');

const collectionsWithName = [
    { collection: Test, name: 'test' },
    { collection: Other, name: 'other' },
]

const { connect } = require('./db/connect');

const app = express();
connect('mongodb+srv://user:1qaz2wsx3edc@cluster0.mut8i.mongodb.net/server?retryWrites=true&w=majority');

const server = app.listen(3000, () => {
    console.log('Server on http://localhost:3000');
});

const io = SocketIO(server)

io.on('connection', (socket) => {
    socket.on('register', async (data) => {
        const { registerData, authInfo } = data;
        const { groupId, individualId } = registerData;
        const dataToSave = {
            socketId: socket.id,
            groupId,
            individualId,
        }
        socket.join(groupId);
        
        const syncState = {
            individualId,
            synced: false,
        };

        const noSyncState = {
            individualId,
            synced: true,
        };

        await Device.updateOne({ individualId }, dataToSave, { upsert: true, strict: false });

        const dataPending = collectionsWithName.map(
            ({ collection }) => collection.find({ $or: [ { syncState }, { "syncState": { "$ne": noSyncState } } ]}).select('-_id -syncState')
        );
        const dataToSync = await Promise.all(dataPending);
        const { socketId } = await Device.findOne({individualId}).select('-_id socketId');

        dataToSync.forEach((arrayDataByCollection, index) => {
            arrayDataByCollection.forEach((document) => {
                const { name } = collectionsWithName[index]
                io.to(socketId).emit('sync', { name, document });     
            });
        });

    });

    socket.on('sync', async (data) => {
        const { name, document, groupId } = data;
        const { idGlobal } = document;
        
        io.in(groupId).clients(async (error, socketClientsId) => {
            if (error) throw error;
            const allDevices = await Device.find({ groupId }).select('-_id individualId');
            const clientsObj = await Device.find({ socketId: { "$in" : socketClientsId} }).select('-_id individualId');
            const clients = clientsObj.map((obj) => obj.individualId );
            const allSocketsIds = allDevices.map((device) => device.individualId );
            const syncState = allSocketsIds.map((individualId) => {
                return {
                    individualId,
                    synced: clients.includes(individualId),
                }
            });
            socket.to(groupId).emit('sync', { name, document });
            document.syncState = syncState;
            document.groupId = groupId;
            const { collection } = collectionsWithName.find(obj => obj.name === name);
            await collection.updateOne({ idGlobal }, document, { upsert: true, strict: false });
        });
    });
});
