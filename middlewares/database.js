var config = require('../config');
var mongoose = require('mongoose');

mongoose.connect(config.DataBaseConnectionUrl, { useNewUrlParser: true })
    .then(() => {
        console.log("Database connection established!");
    },
        err => {
            console.log("Error connecting Database instance due to: ", err);
        }
    );

module.exports = mongoose.connection;