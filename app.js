require('dotenv').config();
require('./models/connection');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var categorieRouter = require('./routes/categorie');
var recoRouter = require('./routes/reco');
var recetteRouter = require('./routes/recette');

var app = express();

const fileUpload = require('express-fileupload');
app.use(
  fileUpload({
    tempFileDir: path.join(__dirname, '..', 'tmp'),
  }),
);

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/reco', recoRouter);
app.use('/categorie', categorieRouter);
app.use('/recette', recetteRouter);

module.exports = app;
