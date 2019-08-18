var authorize = require('../middlewares/authorization');
var router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

router.post('/studentsignin', function (req, res) {

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
            if (!result) {
                res.render('invalid');
                return res.status(401).send();
            }
            else {
                const jwtPayload = {
                    user_id: user._id
                }
                const authJwtToken = jwt.sign(jwtPayload, process.env.SECRET);
                res.set('Authorization', authJwtToken);

                return res.status(200).send({ accessToken: authJwtToken });
            }
        });
    });
});

router.get('/searchInstitutes', function (req, res) {

    var collection = req.db.collection('coachinginstitutes');

    if (req.query.city === "Select") {

        collection.find({ name: req.query.tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            return res.status(200).send(institute);
        });
    }
    else if (req.query.location === "SelectLocation") {
        collection.find({ name: req.query.tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            var i;
            var result = [];

            for (i in institute.branches) {
                if (institute.branches[i].city === req.query.city) {
                    result.push(institute.branches[i]);
                }
            }
            return res.status(200).send(result);
            //res.render('result',{institute: institute});
        });
    }
    else {
        collection.findOne({ name: req.query.tag }, function (err, institute) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            var i;
            for (i in institute.branches) {
                if (institute.branches[i].city === req.query.city && institute.branches[i].location === req.query.location) {
                    break;
                }
            }
            return res.status(200).send(institute.branches[i]);
            //res.render('result',{institute: institute});
        });
    }
});

router.get('/viewDetails', function (req, res) {

    var collection = req.db.collection('coachinginstitutes');

    collection.findOne({ name: req.query.tag }, function (err, institute) {
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
            if (institute.branches[i].branchId === req.query.branchId) {
                break;
            }
        }
        for (j in institute.branches[i].comment) {
            result.comment.push(institute.branches[i].comment[j]);
        }
        var avgRating = institute.branches[i].rating / institute.branches[i].rateCount;
        result.avgRating = avgRating.toString();
        return res.status(200).send(result);
    });
});

router.post('/profileStudent', function (req, res) {

    var collection = req.db.collection('students');

    switch (req.body.type) {
        case 'contact':
            {
                collection.update({ name: req.session.user.name }, { "$set": { "contact": req.body.field } }, function (err, doc) {

                    if (err) {
                        return res.status(500).send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('contact updated successfully');
                    }
                });
            }

        case "password":
            {
                collection.update({ name: req.session.user.name }, { "$set": { "password": field } }, function (err, doc) {

                    if (err) {
                        return res.status(500).send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('password updated successfully');
                    }
                });
            }

        case 'email':
            {
                collection.update({ name: req.session.user.name }, { "$set": { "email": field } }, function (err, doc) {

                    if (err) {
                        return res.status(500).send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('email updated successfully');
                    }
                });
            }
    }
});

router.post('/rate', function (req, res) {

    var collection = req.db.collection('coachinginstitutes');

    collection.update({ name: req.body.tag, "branches.branchId": req.body.branchId }, { "$inc": { "branches.$.rating": parseInt(req.body.rating) } }, function (err, institute) {
        if (err) {
            return res.status(500).send();
        }
    });
    collection.update({ name: tag, "branches.branchId": branchId }, { "$inc": { "branches.$.rateCount": 1 } }, function (err, doc) {
        if (err) {
            return res.status(500).send();
        }
    });
    //res.render('institutes');
    return res.status(200).send('rated successfully');
});

router.post('/review', authorize, function (req, res) {

    var collection = req.db.collection('coachingInstitutes');

    collection.updateOne({ name: req.body.tag, "branches.branchId": req.body.branchId }, { "$push": { "branches.$.comment": req.body.comment } }, function (err, institute) {
        if (err) {
            return res.status(500).send();
        }
    });
    //res.render('institutes');
    return res.status(200).send('added review successfully');
});

router.get('/searchAccommodation', function (req, res) {

    var collection = req.db.collection('accommodation');

    if (req.query.locationAcc === "SelectLocation") {
        collection.find({ "city": req.query.cityAcc }, function (err, acc) {
            if (err) {
                return res.status(500).send();
            }
            res.send(acc);
            //res.render('result',{institute: institute});
        });
    }
    else {
        collection.find({ "city": city, "location": location }, function (err, acc) {
            if (err) {
                return res.status(500).send();
            }
            return res.status(200).send(acc);
            //res.render('result',{institute: institute});
        });
    }
});

module.exports = router;