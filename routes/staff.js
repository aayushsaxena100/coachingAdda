var router = require('express').Router();

router.get('/staffLogin', function (req, res) {
    res.render('staffLogin');
});

router.post('/staffLogin', function (req, res) {
    var db = req.db;
    var username = req.body.username;
    var password = req.body.password;
    var collection = db.get('staff');

    collection.findOne({ username: username, password: password }, function (err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        if (!user) {
            res.render('invalid');
            return res.status(401).send();
        }
        res.render('staff');
    });
});

router.get('/validate', function (req, res) {

    var db = req.db;
    var collection = db.get('coachinginstitutes');
    collection.find({ "valid": "no" }, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        res.send(institute);
    });
});

router.get('/validateInstitute', function (req, res) {

    var db = req.db;
    var name = req.query.name;
    var collection = db.get('coachinginstitutes');

    collection.update({ "name": name }, { "$set": { "valid": "yes" } }, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        res.send('done');
    });
});

router.get('/accommodationDetails', function (req, res) {
    var db = req.db;
    var name = req.query.name;
    var address = req.query.address;
    var rent = req.query.rent;
    var location = req.query.location;
    var city = req.query.city;
    var collection = db.get('accommodation');

    collection.insert({
        "name": name,
        "address": address,
        "city": city,
        "location": location,
        "rent": rent
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            res.send('done');
        }
    });
});

module.exports = router;