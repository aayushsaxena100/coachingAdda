module.exports = {
    DataBaseConnectionUrl: process.env.DATABASE_CONNECTION_URL,
    secret: process.env.SECRET,
    redisConf: {
        host: 'redis-18570.c1.asia-northeast1-1.gce.cloud.redislabs.com',
        port: '18570',
        password: process.env.REDIS_PASSWORD
    }
};