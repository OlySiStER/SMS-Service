const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/assets'));

var url = 'mongodb://localhost:27017/smsservice';

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear()
});

app.get('/', (req, res) => {
    res.render('login.hbs');
});

app.get('/home', (req, res) => {
    res.render('home.hbs');
});

app.get('/about', (req, res) => {
    res.render('about.hbs');
});

app.get('/contact', (req, res) => {
    res.render('contact.hbs');
});

app.get('/smsservice', (req, res) => {
    res.render('smsservice.hbs');
});

app.post('/sendsms', (req, res) => {
    //https://www.intellisoftware.co.uk
    var intelliSMS = require('intellisms');
    var sms = new intelliSMS('smshospital', 'smsservice');
    // console.log(req.body.telno + " " + req.body.msg_data);
    //number and message 
    sms.SendMessage({ to: req.body.telno, text: req.body.msg_data }, function(err, id) {
        if (err) console.log(err);
        console.log(id);
        console.log("Send message to " + req.body.fname + " " + req.body.lname + " " + req.body.telno)
        res.redirect('/smsservice');
    });
});

app.get('/smsservice_multiple', (req, res) => {
    res.render('smsservice_multiple.hbs');
});

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({ //multer settings
    storage: storage,
    fileFilter: function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

/** API path that will upload the files */
app.post('/upload', function(req, res) {
    var exceltojson;
    upload(req, res, function(err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }
        /** Check the extension of the incoming file and 
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        console.log(req.file.path);
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function(err, result) {
                if (err) {
                    return res.json({ error_code: 1, err_desc: err, data: null });
                }
                // res.json({ error_code: 0, err_desc: null, data: result });
                // console.log(result[0]);
                for (var i = 0; i < result.length; i++) {
                    var intelliSMS = require('intellisms');
                    var sms = new intelliSMS('smshospital', 'smsservice');
                    // console.log(req.body.telno + " " + req.body.msg_data);
                    //number and message 
                    var list = result[i];
                    sms.SendMessage({ to: list.tel, text: list.message }, function(err, id) {
                        if (err) console.log(err);
                        console.log(id);
                        // res.redirect('/smsservice');
                    });
                    // var list = result[i];
                    // console.log(list.fname);
                    // MongoClient.connect(url, function(err, db) {
                    //     assert.equal(null, err);
                    //     db.collection('recipientList').insertOne({
                    //         no: list.no,
                    //         fname: list.fname,
                    //         lname: list.lname,
                    //         tel: list.tel,
                    //         message: list.message,
                    //     }, function(err, result) {
                    //         assert.equal(null, err);
                    //         console.log('Item inserted');
                    //         db.close();
                    //     });
                    // });
                }




                res.redirect('/home');





            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted excel file" });
        }
    })

});

app.post('/loginCheck', (req, res) => {
    var resultArray = [];
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log(req.body.uname);
        console.log(req.body.pass);
        var cursor = db.collection('users').find({
            email: req.body.uname,
            pass: req.body.pass
        });
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function() {
            db.close();
            if (resultArray == '') {
                res.redirect('/');
            } else {
                res.redirect('/smsservice');
            }
        });
    });
});

app.post('/regisToDB', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('users').insertOne({
            fname: req.body.fnameRegis,
            lname: req.body.lnameRegis,
            email: req.body.emailRegis,
            pass: req.body.passRegis
        }, function(err, result) {
            assert.equal(null, err);
            console.log('Regis complete - insert user to db');
            db.close();
        });
    });

    res.redirect('/');
});

app.get('/bad', (req, res) => {
    res.send({
        errorMessage: 'Unable to handle request'
    });
});

app.get('/help', (req, res) => {
    // res.send('<h1><center>Contact Page</center></h1>');
    res.sendFile(__dirname + '/public/help.html');
});

app.listen(3001, () => {
    console.log('Server is up on port 3001');
});