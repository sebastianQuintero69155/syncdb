const { Schema, model } = require('mongoose');

const schemaTest = new Schema({
    groupId: {
        type: String,
        required: true,
    },
    syncState: [{
        individualId: {
            type: String,
        },
        synced: {
            type: Boolean,
        }
    }],
    datatosync: {
        type: String,
    },
});

module.exports = model('Other', schemaTest);
