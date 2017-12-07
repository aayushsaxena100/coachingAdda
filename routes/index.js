var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/signup', function(req, res) {
    res.render('signup');
});

router.get('/login', function(req, res) {
    res.render('login');
});

router.post('/studentSignup', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    // Set our collection
    var collection = db.get('students');

    // Submit to the DB
    collection.insert({
        "email" : email,
        "password" : password,
        "name" : name
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

router.post('/instituteSignup', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    // Set our collection
    var collection = db.get('coachinginstitutes');

    // Submit to the DB
    collection.insert({
        "email" : email,
        "password" : password,
        "name" : name,
        "valid" : "no",
        "branches" : [],
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

router.post('/studentSignin', function(req, res) {
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var email = req.body.email;
  var password = req.body.password;

  var collection = db.get('students');

  collection.findOne({email: email, password: password}, function(err, user){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    if(!user){
      res.render('invalid');
      return res.status(401).send();
    }
    req.session.user = user;
    res.render('welcome',{user: user});
  });
});

router.post('/instituteSignin', function(req, res) {
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var email = req.body.email;
  var password = req.body.password;

  var collection = db.get('coachinginstitutes');

  collection.findOne({email: email, password: password}, function(err, user){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    if(!user){
      res.render('invalid');
      return res.status(401).send();
    }
    else if(user.valid === "no"){
      return res.send('You have yet not been verified.')
    }
    req.session.user = user;
    res.render('instituteHome');
  });
});


router.get('/institutes', function(req, res) {
    res.render('institutes');
});


router.get('/searchInstitutes', function(req, res) {

  var db = req.db;
  var tag = req.query.tag;
  var city = req.query.city;
  var location = req.query.location;
  var collection = db.get('coachinginstitutes');

  if(city === "Select"){

      collection.find({name: tag}, function(err, institute){
      if(err){
        console.log(err);
        return res.status(500).send();
      }
      res.send(institute);
    });    
  }
  else if(location === "SelectLocation")
  {
    collection.find({name: tag}, function(err, institute){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    var i;
    var result=[];

    for (i in institute.branches) {
      if (institute.branches[i].city===city) {
        result.push(institute.branches[i]);
      }
    }
    res.send(result);
    //res.render('result',{institute: institute});
    });
  }
  else
  {
    collection.findOne({name: tag}, function(err, institute){
      if(err){
        console.log(err);
        return res.status(500).send();
      }
      var i;
      for (i in institute.branches) {
        if (institute.branches[i].city===city && institute.branches[i].location===location) {
          break;
        }
      }
      res.send(institute.branches[i]);
      //res.render('result',{institute: institute});
    });
  }
});

router.get('/welcome', function(req, res){
  if(!req.session.user){
    return res.status(401).send('Not Logged In!');
  }
  return res.status(200).render('welcome');
});

/*router.post('/institutes', function(req, res){
  if(!req.session.user){
    return res.status(401).send('Not Logged In!');
  }
  var db = req.db;
  var tag = req.body.tag;
  var collection = db.get('coachinginstitutes');
  collection.find({name: tag}, function(err, institute){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    res.render('institutes',{institute : institute});
    //res.render('result',{institute: institute});
  });
});*/

router.post('/addBranch', function(req, res){
  if(!req.session.user){
    return res.status(401).send('Not Logged In!');
  }
  var db = req.db;
  var address = req.body.address;
  var city = req.body.city;
  var location = req.body.location;
  var contact = req.body.contact;
  var percent = req.body.percent;
  var email = req.body.email;
  var count=0;

  var collection = db.get('coachinginstitutes');

  collection.find({}, function(err, institute){
      if(err){
        console.log(err);
        return res.status(500).send();
      }
      var i;
      console.log(institute.length);
      for (i=0; i<institute.length; i++) {
        console.log(institute[i].branches.length);
        count = count + institute[i].branches.length;
        }
        count = count + 1;
        console.log('count'+count);
        collection.update({name: req.session.user.name},{"$push":{"branches":{"address": address,
                                                                        "city": city,
                                                                        "location": location,
                                                                        "contact": contact,
                                                                        "percent": percent,
                                                                        "email" : email,
                                                                        "branchId" : count.toString(),
                                                                        "avgRating" : 0,
                                                                        "rateCount" : 0
                                                                        }
                                                            }
                                                    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  });
});


router.post('/editBranch', function(req,res){
  var type = req.body.type;
  var field = req.body.field;
  var b_city = req.body.b_city;
  var b_location = req.body.b_location;

  var db = req.db;

  var collection = db.get('coachinginstitutes');

  if(type==="address")
  {
    collection.update({name: req.session.user.name, "branches.city":b_city, "branches.location":b_location},{"$set": {"branches.$.address" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
  else if(type==="contact")
  {
    collection.update({name: req.session.user.name, "branches.city":b_city, "branches.location":b_location},{"$set": {"branches.$.contact" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
  else if(type==="location")
  {
    collection.update({name: req.session.user.name, "branches.city":b_city, "branches.location":b_location},{"$set": {"branches.$.location" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
  else if(type==="city")
  {
    collection.update({name: req.session.user.name, "branches.city":b_city, "branches.location":b_location},{"$set": {"branches.$.city" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
  else if(type==="percent")
  {
    collection.update({name: req.session.user.name, "branches.city":b_city, "branches.location":b_location},{"$set": {"branches.$.percent" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
});


router.post('/deleteBranch', function(req,res){
  var city = req.body.d_city;
  var location = req.body.d_location;

  var db = req.db;

  var collection = db.get('coachinginstitutes');

  collection.update({name: req.session.user.name},{"$pull": {"branches": {"city" : city, "location" : location}}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            console.log(err);
            res.send("There was a problem deleting the information from the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });  

});


router.post('/profileStudent', function(req, res){

  var type = req.body.type;
  var field = req.body.field;

  var db = req.db;

  var collection = db.get('students');

  if(type==="contact")
  {
    collection.update({name: req.session.user.name},{"$set": {"contact" : field}}, function (err, doc) {
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
  else if(type==="password")
  {
    collection.update({name: req.session.user.name},{"$set": {"password" : field}}, function (err, doc) {
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
  else if(type==="email")
  {
    collection.update({name: req.session.user.name},{"$set": {"email" : field}}, function (err, doc) {
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


router.post('/profileInstitute', function(req, res){

  var type = req.body.type;
  var field = req.body.field;

  var db = req.db;

  var collection = db.get('coachinginstitutes');

  if(type==="contact")
  {
    collection.update({name: req.session.user.name},{"$set": {"contact" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
  else if(type==="password")
  {
    collection.update({name: req.session.user.name},{"$set": {"password" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
  else if(type==="email")
  {
    collection.update({name: req.session.user.name},{"$set": {"email" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
  else if(type==="hq")
  {
    collection.update({name: req.session.user.name},{"$set": {"hq" : field}}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.render('instituteHome');
        }
    });
  }
});


router.get('/staffLogin', function(req, res){
  res.render('staffLogin');
});

router.post('/staffLogin', function(req, res) {
  var db = req.db;
  var username = req.body.username;
  var password = req.body.password;
  var collection = db.get('staff');
  //var instituteCollection = db.get('coachinginstitutes');

  collection.findOne({username: username, password: password}, function(err, user){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    if(!user){
      res.render('invalid');
      return res.status(401).send();
    }
    res.render('staff');
  });
});

router.get('/validate',function(req, res) {

  var db = req.db;
  var collection = db.get('coachinginstitutes');
  collection.find({"valid": "no"}, function(err, institute){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    res.send(institute);
  });
});

router.get('/validateInstitute',function(req, res) {

  var db = req.db;
  var name = req.query.name;
  var collection = db.get('coachinginstitutes');

  collection.update({"name": name},{"$set": {"valid" : "yes"}}, function(err, institute){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    res.send('done');
  });
});


router.post('/rate',function(req, res){
  var rating = req.body.rating;
  var branchId = req.body.branchId;
  var db = req.db;
  var tag = req.body.tag;
  var collection = db.get('coachinginstitutes');

  collection.update({name: tag, "branches.branchId":branchId},{"$inc": {"branches.$.rating" : parseInt(rating)}}, function(err, institute){
    if (err) 
    {
      console.log(err);
      return res.status(500).send();
    }
  });
  collection.update({name: tag, "branches.branchId":branchId},{"$inc": {"branches.$.rateCount" : 1}}, function (err, doc) {
      if (err) {
        console.log('could not rate '+err);
        return res.status(500).send();
      }
    });
  res.render('institutes');
});

router.get('/logout', function(req, res){
  req.session.destroy();
  res.render('loggedOut');
  return res.status(200).send();
});

router.post('/review',function(req, res){
  var comment = req.body.comment;
  var branchId = req.body.branchId;
  var db = req.db;
  var tag = req.body.tag;
  var collection = db.get('coachinginstitutes');
  console.log(branchId);
  collection.update({name: tag, "branches.branchId":branchId},{"$push": {"branches.$.comment" : comment}}, function(err, institute){
    if (err) 
    {
      console.log(err);
      return res.status(500).send();
    }
  });
  res.render('institutes');
});


router.get('/viewDetails', function(req, res) {

  var db = req.db;
  var tag = req.query.tag;
  var branchId = req.query.branchId;
  var collection = db.get('coachinginstitutes');

  collection.findOne({name: tag}, function(err, institute){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    var i,j;
    var result={
      "avgRating": "",
      "comment" : []
    };
    for(i in institute.branches)
    {
      if(institute.branches[i].branchId===branchId)
      {
        break;
      }
    }
    for(j in institute.branches[i].comment)
    {
      result.comment.push(institute.branches[i].comment[j]);
    }
    var avgRating = institute.branches[i].rating/institute.branches[i].rateCount;
    result.avgRating = avgRating.toString(); 
    res.send(result);
    });
});


router.get('/accommodationDetails', function(req, res){
  var db = req.db;
  var name = req.query.name;
  var address = req.query.address;
  var rent = req.query.rent;
  var location = req.query.location;
  var city = req.query.city;
  var collection = db.get('accommodation');

  collection.insert({
        "name" : name,
        "address" : address,
        "city" : city,
        "location" : location,
        "rent" : rent
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


router.get('/searchAccommodation', function(req, res) {

  var db = req.db;
  var city = req.query.cityAcc;
  var location = req.query.locationAcc;
  var collection = db.get('accommodation');

  if(location === "SelectLocation")
  {
    collection.find({"city": city}, function(err, acc){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    console.log(acc);
    res.send(acc);
    //res.render('result',{institute: institute});
    });
  }
  else
  {
    collection.find({"city": city, "location": location}, function(err, acc){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    console.log(acc);
    res.send(acc);
    //res.render('result',{institute: institute});
    });
  }
});


router.get('/logout', function(req, res){
  req.session.destroy();
  res.render('loggedOut');
  return res.status(200).send();
});

module.exports = router;
