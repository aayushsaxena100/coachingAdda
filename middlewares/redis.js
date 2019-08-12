var redis = require('redis').createClient({
    host: config.redisConf.host,
    port: config.redisConf.port,
    no_ready_check: true,
    auth_pass: config.redisConf.password
});

module.exports = () => {
    redis.on('connect', () => {
        console.log('connected to redis');
    });

    redis.on('error', err => {
        console.log(`Error: ${err}`);
    });
}