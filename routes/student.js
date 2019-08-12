var router = require('express').Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/studentSignup', function (req, res) {

    var collection = req.db.collection('students');
    collection.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send('There was some error in sigining you up. Please try again after some time.');
        }
        else if (user) {
            return res.status(500).send('A student by that email already exists.');
        }
    });

    bcrypt.hash(req.body.password, saltRounds, function (err, passwordHash) {
        if (err) {
            console.log(err);
            res.status(500).send('There was some error in sigining you up. Please try again after some time.');
        }
        collection.insertOne({
            "email": req.body.email,
            "password": passwordHash,
            "name": req.body.name
        }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.render('login');
            }
        });
    });
});

router.get('/studentsignin', function (req, res) {

    var collection = req.db.collection('students');

    collection.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).send('There was some error in logging you in.');
            }
            if (result) {
                req.session.user = user;
                res.render('welcome', { user: user });
                return res.status(200).send();
            }
            else {
                res.render('invalid');
                return res.status(401).send();
            }
        });
    });
});

router.get('/searchInstitutes', function (req, res) {

    var db = req.db;
    var tag = req.query.tag;
    var city = req.query.city;
    var location = req.query.location;
    var collection = db.collection('coachinginstitutes');

    if (city === "Select") {

        collection.find({ name: tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            res.send(institute);
        });
    }
    else if (location === "SelectLocation") {
        collection.find({ name: tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            var i;
            var result = [];

            for (i in institute.branches) {
                if (institute.branches[i].city === city) {
                    result.push(institute.branches[i]);
                }
            }
            res.send(result);
            //res.render('result',{institute: institute});
        });
    }
    else {
        collection.findOne({ name: tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            var i;
            for (i in institute.branches) {
                if (institute.branches[i].city === city && institute.branches[i].location === location) {
                    break;
                }
            }
            res.send(institute.branches[i]);
            //res.render('result',{institute: institute});
        });
    }
});

router.get('/viewDetails', function (req, res) {

    var db = req.db;
    var tag = req.query.tag;
    var branchId = req.query.branchId;
    var collection = db.collection('coachinginstitutes');

    collection.findOne({ name: tag }, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        var i, j;
        var result = {
            "avgRating": "",
            "comment": []
        };
        for (i in institute.branches) {
            if (institute.branches[i].branchId === branchId) {
                break;
            }
        }
        for (j in institute.branches[i].comment) {
            result.comment.push(institute.branches[i].comment[j]);
        }
        var avgRating = institute.branches[i].rating / institute.branches[i].rateCount;
        result.avgRating = avgRating.toString();
        res.send(result);
    });
});

router.post('/profileStudent', function (req, res) {

    var type = req.body.type;
    var field = req.body.field;

    var db = req.db;

    var collection = db.collection('students');

    if (type === "contact") {
        collection.update({ name: req.session.user.name }, { "$set": { "contact": field } }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.render('welcome');
            }
        });
    }
    else if (type === "password") {
        collection.update({ name: req.session.user.name }, { "$set": { "password": field } }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.render('welcome');
            }
        });
    }
    else if (type === "email") {
        collection.update({ name: req.session.user.name }, { "$set": { "email": field } }, function (err, doc) {
            if (err) {
                // If it failed, return error
                res.send("There was a problem adding the information to the database.");
            }
            else {
                // And forward to success page
                res.render('welcome');
            }
        });
    }
});

router.post('/rate', function (req, res) {
    var rating = req.body.rating;
    var branchId = req.body.branchId;
    var db = req.db;
    var tag = req.body.tag;
    var collection = db.collection('coachinginstitutes');

    collection.update({ name: tag, "branches.branchId": branchId }, { "$inc": { "branches.$.rating": parseInt(rating) } }, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
    });
    collection.update({ name: tag, "branches.branchId": branchId }, { "$inc": { "branches.$.rateCount": 1 } }, function (err, doc) {
        if (err) {
            console.log('could not rate ' + err);
            return res.status(500).send();
        }
    });
    res.render('institutes');
});

router.post('/review', function (req, res) {
    var comment = req.body.comment;
    var branchId = req.body.branchId;
    var db = req.db;
    var tag = req.body.tag;
    var collection = db.collection('coachinginstitutes');
    console.log(branchId);
    collection.update({ name: tag, "branches.branchId": branchId }, { "$push": { "branches.$.comment": comment } }, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
    });
    res.render('institutes');
});

router.get('/searchAccommodation', function (req, res) {

    var db = req.db;
    var city = req.query.cityAcc;
    var location = req.query.locationAcc;
    var collection = db.collection('accommodation');

    if (location === "SelectLocation") {
        collection.find({ "city": city }, function (err, acc) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            console.log(acc);
            res.send(acc);
            //res.render('result',{institute: institute});
        });
    }
    else {
        collection.find({ "city": city, "location": location }, function (err, acc) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            console.log(acc);
            res.send(acc);
            //res.render('result',{institute: institute});
        });
    }
});

module.exports = router;