var jwt = require('jsonwebtoken');
var config = require('../config');

module.exports = function (req, res, next) {

    if (!req.session.user) {

        return res.status(401).send('You are not logged in.');
    }

    var userAccessToken = req.header('Authorization');

    if (userAccessToken.startsWith('Bearer ')) {

        userAccessToken = userAccessToken.slice(7, userAccessToken.length);
    }

    if (!userAccessToken) {

        return res.status(401).send('Invalid access token!');
    }

    try {

        var isValidAccessToken = jwt.verify(userAccessToken, config.jwt_publicKey, config.jwt_verifyOptions);

        if (isValidAccessToken) {

            res.status(200);
            next();
        }
        else {

            return res.status(401).send('Unauthorized access!');
        }
    }
    catch (err) {

        console.log(err);
        return res.status(500).send('Could not verify your identity. Please try again after some time');
    }
}