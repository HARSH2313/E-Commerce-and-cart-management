const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const route = require('./route/route.js');
const multer= require("multer");
const bcrypt = require('bcrypt')
const app = express();
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( multer().any())


mongoose.connect("mongodb+srv://AshutoshGupta:ashutosh54264850@cluster0.ukus0.mongodb.net/group68database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route)

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port: ' + (process.env.PORT || 3000))
}) 