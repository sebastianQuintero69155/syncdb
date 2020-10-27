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
    data: {
        type: String,
    }
});

module.exports = model('Test', schemaTest);