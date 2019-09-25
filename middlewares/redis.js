var config = require('../config');

var redis = require('redis').createClient({
    host: config.redisConf.host,
    port: config.redisConf.port,
    no_ready_check: true,
    auth_pass: config.redisConf.password
});

redis.on('connect', function () {

    console.log('connected to redis');
});

redis.on('err', function (err) {

    console.log(err);
});

exports.lookUpStudentInCache = function (email, callback) {
    var key = "students-" + email;

    redis.get(key, function (err, stringReply) {

        if (err) {
            console.log(err);
            callback(null);
        }

        callback(JSON.parse(stringReply));
    });
}

exports.saveStudentInCache = function (key, student, callback) {

    try {
        redis.setex("students-" + key, 3600 * 24, JSON.stringify(student));
        callback(true);
    }
    catch (e) {
        callback(false);
    }
}