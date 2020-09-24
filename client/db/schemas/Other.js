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
    datatosync: {
        type: String,
    },
});

module.exports = model('Other', schemaTest);