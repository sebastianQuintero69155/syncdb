const { Schema, model } = require('mongoose');

const schemaTest = new Schema({
    groupId: {
        type: String,
        required: true,
    },
    synced: {
        type: Boolean,
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
    data: {
        type: String,
    },
    extraData: {
        type: Number,
    }
});

module.exports = model('Test', schemaTest);