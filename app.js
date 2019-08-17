var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config');
var index = require('./routes/index');
var staff = require('./routes/staff');
var student = require('./routes/student');
var institute = require('./routes/institute');

var app = express();
var db = require('./middlewares/database');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use('/', index);
app.use('/', staff);
app.use('/', student);
app.use('/', institute);

app.use('/', require('./middlewares/error'));

module.exports = app;