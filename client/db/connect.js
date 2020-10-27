const mongoose = require('mongoose');

const { log, error } = console;

const connect = (MONGO_URI) => {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err) => {
    error(err);
  });
  const db = mongoose.connection;
  db.once('open', () => log(`Connection success [Mongo]`));
  return db;
};

module.exports = {
  connect,
};