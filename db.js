const { connect } = require('./db/connect');
const Test = require('./db/schemas/Test');
const Other = require('./db/schemas/Other');

const collections = [Test, Other]

const cloudDB = 'mongodb+srv://dbUser:YYsXgrC428fw39vK@cluster0.6scot.mongodb.net/test?retryWrites=true&w=majority';

connect(cloudDB);

async function syncDataBase() {

    const dataToSyncPromises = collections.map(async (collection) => {
        return collection.find({synced: false});
    });
    const dataToSync = await Promise.all(dataToSyncPromises);

    collections.forEach( async (collection, index) => {
        const collectionData = dataToSync[index];
        collectionData.forEach(async (data) => {
            const { idGlobal } = data;
            await collection.update({ idGlobal }, data, {upsert: true});
        })
    });

}