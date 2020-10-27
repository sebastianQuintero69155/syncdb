const { Schema, model } = require('mongoose');

const schemaTest = new Schema({
    individualId: {
        type: String,
        required: true,
    },
    groupId: {
        type: String,
        required: true,
    },
    socketId: {
        type: String,
        required: true,
    },
});

module.exports = model('Device', schemaTest);