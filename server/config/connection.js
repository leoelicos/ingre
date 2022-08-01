/*
 * ingre
 * server/config/connection.js
 * This script contains the necessary code to initiate the connection to either mongoDB Atlas, which is used on Heroku, or the default DB, which is used locally
 * Copyright 2022 Leo Wong
 */

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ingre', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = mongoose.connection;
