var http = require('http');
var path = require('path');

var async = require('async');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var configDB = require('./config/database.js');
var app = express();

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to database
require('./config/passport')(passport); // passport configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// passport
app.use(session({ secret: 'dfhgfjhgkjhdfe3256hge46' })); 
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes ======================================================================
require('./app/routes.js')(app, passport); 

var server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, 'client')));
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("SafeBoard server listening at", addr.address + ":" + addr.port);
});
