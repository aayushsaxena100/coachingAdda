var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/signup', function (req, res) {
  res.render('signup');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.get('/institutes', function (req, res) {
  res.render('institutes');
});

router.get('/welcome', function (req, res) {
  if (!req.session.user) {
    return res.status(401).send('Not Logged In!');
  }
  return res.status(200).render('welcome');
});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('loggedOut');
  return res.status(200).send();
});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('loggedOut');
  return res.status(200).send();
});

module.exports = router;