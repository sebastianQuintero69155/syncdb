const express = require('express');

const Test = require('./db/schemas/Test');
const Other = require('./db/schemas/Other');

const collectionsWithName = [
    { collection: Test, name: 'test'},
    { collection: Other, name: ' other'},
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
        const dataToSave = {
            socketId: socket.id,
            groupId: data.groupId,
            individualId: data.individualId
        }
        await Device.updateOne({ individualId: data.individualId }, dataToSave, {upsert: true});
    });

    socket.on('sync', async (data) => {
        const { name, document, individualId } = data;
        const { idGlobal } = document;
        const { collection } = collectionsWithName.find( obj => obj.name === name );
        await collection.updateOne({ idGlobal }, document, {upsert: true, strict: false});
        const deviceInfo = await Device.findOne({ individualId });
        console.log(deviceInfo)
        const { socketId } = deviceInfo;
        io.clients[socketId].send()
    });
});
