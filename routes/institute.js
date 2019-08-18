var authorize = require('../middlewares/authorization');
var router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

router.post('/institutesignup', function (req, res) {

    var collection = req.db.collection('coachingInstitutes');

    collection.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send('There was some error in sigining you up. Please try again after some time.');
        }
        else if (user) {
            return res.status(402).send('A coaching institute by that email already exists.');
        }

        bcrypt.hash(req.body.password, saltRounds, function (err, passwordHash) {
            if (err) {
                console.log(err);
                return res.status(500).send('There was some error in sigining you up. Please try again after some time.');
            }
            collection.insertOne({
                "email": req.body.email,
                "password": passwordHash,
                "name": req.body.name,
                "valid": false
            }, function (err, doc) {
                if (err) {
                    return res.status(500).send("There was a problem while creating your account.");
                }
                else {
                    return res.status(200).send('signup successful');
                }
            });
        });
    });
});

router.post('/instituteSignin', function (req, res) {

    var collection = req.db.collection('coachingInstitutes');

    collection.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        else if (!user) {
            return res.status(404).send('The email is not registered.');
        }

        bcrypt.compare(req.body.password, user.password, function (err, isPasswordMatching) {
            if (err) {
                console.log(err);
                return res.status(500).send('There was some error in logging you in.');
            }
            if (!isPasswordMatching) {
                //res.render('invalid');
                return res.status(401).send('Password incorrect');
            }
            if (!user.valid) {
                return res.send('You have yet not been verified.');
            }
            else {
                const jwtPayload = {
                    user_id: user._id
                }
                const authJwtToken = jwt.sign(jwtPayload, process.env.SECRET);
                res.set('Authorization', authJwtToken);
                req.session.user = user;

                return res.status(200).send({ accessToken: authJwtToken });
            }
        });
    });
});

router.post('/addBranch', authorize, function (req, res) {

    var count = 0;

    var collection = req.db.collection('coachingInstitutes');

    collection.find({}, function (err, institute) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }

        for (i = 0; i < institute.length; i++) {
            console.log(institute[i].branches.length);
            count = count + institute[i].branches.length;
        }
        count = count + 1;

        collection.update({ name: req.session.user.name }, {
            "$push": {
                "branches": {
                    "address": req.body.address,
                    "req.body.d_city": req.body.req.body.d_city,
                    "req.body.d_location": req.body.req.body.d_location,
                    "contact": req.body.contact,
                    "percent": req.body.percent,
                    "email": req.body.email,
                    "branchId": count.toString(),
                    "avgRating": 0,
                    "rateCount": 0
                }
            }
        }, function (err, doc) {
            if (err) {
                res.status(500).send("There was a problem adding the information to the database.");
            }
            else {
                res.status(200).send('branch added sucessfully.');
            }
        });
    });
});


router.post('/editBranch', authorize, function (req, res) {

    var collection = req.db.collection('coachingInstitutes');

    switch (req.body.type) {
        case "address":
            {
                collection.update({ name: req.session.user.name, "branches.req.body.d_city": req.body.b_req.body.d_city, "branches.req.body.d_location": req.body.b_req.body.d_location }, { "$set": { "branches.$.address": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Branch edited successfully.');
                    }
                });
            }
        case "contact":
            {
                collection.update({ name: req.session.user.name, "branches.req.body.d_city": req.body.b_req.body.d_city, "branches.req.body.d_location": req.body.b_req.body.d_location }, { "$set": { "branches.$.contact": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Branch edited successfully.');
                    }
                });
            }
        case "location":
            {
                collection.update({ name: req.session.user.name, "branches.req.body.d_city": req.body.b_req.body.d_city, "branches.req.body.d_location": req.body.b_req.body.d_location }, { "$set": { "branches.$.req.body.d_location": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Branch edited successfully.');
                    }
                });
            }
        case "city":
            {
                collection.update({ name: req.session.user.name, "branches.req.body.d_city": req.body.b_req.body.d_city, "branches.req.body.d_location": req.body.b_req.body.d_location }, { "$set": { "branches.$.req.body.d_city": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Branch edited successfully.');
                    }
                });
            }
        case "percent":
            {
                collection.update({ name: req.session.user.name, "branches.req.body.d_city": req.body.b_req.body.d_city, "branches.req.body.d_location": req.body.b_req.body.d_location }, { "$set": { "branches.$.percent": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Branch edited successfully.');
                    }
                });
            }
    }
});


router.post('/deleteBranch', authorize, function (req, res) {

    var collection = req.db.collection('coachingInstitutes');

    collection.update({ name: req.session.user.name }, { "$pull": { "branches": { "req.body.d_city": req.body.d_city, "req.body.d_location": req.body.d_location } } }, function (err, doc) {
        if (err) {
            console.log(err);
            return res.send("There was a problem deleting the information from the database.");
        }
        else {
            return res.status(200).send('Branch deleted successfully.');
        }
    });
});

router.post('/profileInstitute', authorize, function (req, res) {

    var collection = req.db.collection('coachingInstitutes');

    switch (req.body.type) {
        case "contact":
            {
                collection.update({ name: req.session.user.name }, { "$set": { "contact": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Profile edited successfully.');
                    }
                });
            }
        case "password":
            {
                collection.update({ name: req.session.user.name }, { "$set": { "password": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Profile edited successfully.');
                    }
                });
            }
        case "email":
            {
                collection.update({ name: req.session.user.name }, { "$set": { "email": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Profile edited successfully.');
                    }
                });
            }
        case "hq":
            {
                collection.update({ name: req.session.user.name }, { "$set": { "hq": req.body.field } }, function (err, doc) {
                    if (err) {
                        return res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        return res.status(200).send('Profile edited successfully.');
                    }
                });
            }
    }
});

router.post('/accommodationDetails', authorize, function (req, res) {

    var collection = req.db.collection('accommodation');

    collection.insert({
        "name": req.query.name,
        "address": req.query.address,
        "city": req.body.d_city,
        "location": req.body.d_location,
        "rent": req.query.rent
    }, function (err, doc) {
        if (err) {
            return res.send("There was a problem adding the information to the database.");
        }
        else {
            return res.status(200).send('Accommodation details added successfuly.');
        }
    });
});

module.exports = router;