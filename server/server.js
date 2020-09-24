const express = require('express');
const SocketIO = require('socket.io');

const Device = require('./db/schemas/Device');

const Test = require('./db/schemas/Test');
const Other = require('./db/schemas/Other');

const collectionsWithName = [
    { collection: Test, name: 'test'},
    { collection: Other, name: 'other'},
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
        socket.join(groupId);
        const dataToSave = {
            socketId: socket.id,
            groupId,
            individualId,
        }
        await Device.updateOne({ individualId: data.individualId }, dataToSave, {upsert: true});
    });

    socket.on('sync', async (data) => {
        const { name, document, groupId } = data;
        const { idGlobal } = document;
        const { collection } = collectionsWithName.find( obj => obj.name === name );
        await collection.updateOne({ idGlobal }, document, {upsert: true, strict: false});
        socket.to(groupId).emit('sync', { name, document });
    });
});
