var router = require('express').Router();
var authorize = require('../middlewares/authorization');

router.get('/staffLogin', function (req, res) {

    var collection = req.db.collection('staff');

    collection.findOne({ username: req.body.username, password: req.body.password }, function (err, user) {

        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        if (!user) {
            return res.status(401).send('Unauthorized access!');
        }

        req.session.user = user;
        return res.status(200).send('Admin signin successfull!');
    });
});

router.get('/validate', function (req, res) {

    var collection = req.db.collection('coachingInstitutes');
    collection.find({ "valid": false }, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        return res.status(200).send(institute);
    });
});

router.post('/validateInstitute', function (req, res) {

    var collection = req.db.collection('coachingInstitutes');

    collection.update({ name: req.query.name }, { "$set": { valid: true } }, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        return res.status(200).send('Institute validated successfully');
    });
});

router.put('/accommodationDetails', function (req, res) {

    var collection = req.db.collection('accommodation');

    collection.insert({
        "name": req.query.name,
        "address": req.query.address,
        "city": req.query.city,
        "location": req.query.location,
        "rent": rent
    }, function (err, doc) {
        if (err) {
            return res.status(500).send("There was a problem adding the information to the database.");
        }
        else {
            return res.status(200).send('Accommodation details added successfully.');
        }
    });
});

module.exports = router;