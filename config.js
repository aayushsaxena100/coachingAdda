var fileSystem = require('fs');

module.exports = {
    DataBaseConnectionUrl: process.env.DATABASE_CONNECTION_URL,
    secret: process.env.SECRET,
    redisConf: {
        host: 'redis-18570.c1.asia-northeast1-1.gce.cloud.redislabs.com',
        port: '18570',
        password: process.env.REDIS_PASSWORD
    },
    jwt_publicKey: fileSystem.readFileSync('./jwtRS256.key.pub'),
    jwt_privateKey: fileSystem.readFileSync('../jwtRS256.key'),
    jwt_signinOptions: { expiresIn: "1h", algorithm: "RS256" },
    jwt_verifyOptions: { algorithms: ["RS256"] }
};