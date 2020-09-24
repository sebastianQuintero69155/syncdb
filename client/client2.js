const io = require('socket.io-client');
const express = require('express');

const Test = require('./db/schemas/Test');
const Other = require('./db/schemas/Other');

const syncdb = require('./syncdbclient');

const { connect } = require('./db/connect');
connect('mongodb+srv://user:1qaz2wsx3edc@cluster0.mut8i.mongodb.net/test2?retryWrites=true&w=majority');

const app = express();

const socket = io('http://localhost:3000');

const collectionsWithName = [
    { collection: Test, name: 'test' },
    { collection: Other, name: 'other' },
]

app.get('/sync', async (req, res) => {
    try {
        const groupId = 'G1';
        syncdb.send(socket, groupId, collectionsWithName);
        res.json('OK');
    } catch (e) {
        res.json(e);
    }
})

app.listen(5000, () => console.log('Server on http://localhost:5000') );

socket.on('connect', async () => {
    const registerData = { groupId: 'G1', individualId: 'I2' };
    syncdb.register(socket, registerData)
});

socket.on('sync', async (data) => {
    const { name, document } = data;
    const { idGlobal } = document;
    const { collection } = collectionsWithName.find( obj => obj.name === name );
    document.synced = true;
    await collection.updateOne({ idGlobal }, document, {upsert: true, strict: false});
})
