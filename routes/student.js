var authorize = require('../middlewares/authorization');
var router = require('express').Router();
var Institute = require('../schemas/instituteSchema');
var enums = require('../enums');
var config = require('../config');
const jwt = require('jsonwebtoken');
var Student = require('../schemas/studentSchema');

router.post('/studentSignup', function (req, res) {

    var student = new Student({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    Student.SignUp(student, function (SignUpStatus) {

        switch (SignUpStatus) {
            case enums.LoginAndSignUpStatus.Error: {
                return res.status(500).send('Some error occured');
            }

            case enums.LoginAndSignUpStatus.AlreadyExists: {
                return res.status(422).send('Student already exists by that email');
            }

            case enums.LoginAndSignUpStatus.Registered: {
                return res.status(200).send('Sign Up Successful');
            }

            default: {
                return res.status(500).send('Something has gone wrong. This should not have happened!');
            }
        }
    });
});

router.post('/studentsignin', function (req, res) {

    var student = new Student({
        email: req.body.email,
        password: req.body.password
    });

    student.Login(function (LoginStatus) {

        switch (LoginStatus) {
            case enums.LoginAndSignUpStatus.Error: {
                return res.status(500).send('Some error occured');
            }

            case enums.LoginAndSignUpStatus.DoesNotExist: {
                return res.status(500).send('Student does not exists by that email');
            }

            case enums.LoginAndSignUpStatus.Unauthorized: {
                return res.status(401).send('Email or password didn\'t quite match');
            }

            case enums.LoginAndSignUpStatus.Authorized: {

                req.session.user = {
                    email: req.body.email
                }

                const jwtPayload = {
                    user_id: req.body.email
                }

                const authJwtToken = jwt.sign(jwtPayload, process.env.JWT_PRIVATE_KEY, config.jwt_signinOptions);
                res.set('Authorization', authJwtToken);

                return res.status(200).send({ accessToken: authJwtToken });
            }

            default: {
                return res.status(500).send('Something has gone wrong. This should not have happened!');
            }
        }
    });
});

router.get('/searchInstitutes', authorize, function (req, res) {

    Institute.SearchInstitutes(req.query, function (err, institutes) {
        if (err) {

            return res.status(500).send('Some error occured');
        }
        else if (!institutes) {

            return res.status(404).send('No institute found with specified search criteria!');
        }
        else {

            return res.status(200).send(institutes);
        }
    });
});

router.get('/viewDetails', authorize, function (req, res) {

    var collection = req.db.collection('coachinginstitutes');

    collection.findOne({ name: req.body.tag }, function (err, institute) {
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