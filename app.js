require('dotenv').config();
require('./models/connection');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var listRouter = require("./routes/list");

var app = express();

const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    tempFileDir: path.join(__dirname, "..", "tmp"),
  })
);

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/list", listRouter);


module.exports = app;
