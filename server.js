const express = require('express');
const hbs = require('hbs');
// const fs = require('fs');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var MongoClient = require('mongodb').MongoClient;
// var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var bodyParser = require('body-parser');
var app = express();
var expressValidator = require('express-validator');
var expressSession = require('express-session');
var passwordHash = require('password-hash');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/assets'));
app.use(expressSession({ secret: 'max', saveUninitialized: false, resave: false }));

var url = 'mongodb://localhost:27017/smsservice';

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear()
});

app.get('/', (req, res) => {
    // console.log(req.session.alertLogin);
    res.render('login.hbs', {
        loginCheck: req.session.loginCheck,
        regisComplete: req.session.regisComplete,
        alertLogin: req.session.alertLogin
    });
    req.session.alertLogin = null;
    req.session.regisComplete = null;
    req.session.loginCheck = null;
    req.session.loginComplete = null;
});

app.get('/home', (req, res) => {
    console.log(req.session.LimitBalance);
    if (req.session.loginComplete) {
        res.render('home.hbs', {
            success: req.session.success,
            errors: req.session.errors,
            limitBalance: req.session.LimitBalance
        });
    } else {
        req.session.alertLogin = true;
        res.redirect('/');
    }
    req.session.LimitBalance = null;
    req.session.errors = null;
    req.session.success = null;
});

app.get('/about', (req, res) => {
    if (req.session.loginComplete) {
        res.render('about.hbs');
    } else {
        req.session.alertLogin = true;
        res.redirect('/');
    }
});

app.get('/contact', (req, res) => {
    if (req.session.loginComplete) {
        res.render('contact.hbs');
    } else {
        req.session.alertLogin = true;
        res.redirect('/');
    }
});

app.get('/smsservice', (req, res) => {
    if (req.session.loginComplete) {
        res.render('smsservice.hbs');
    } else {
        req.session.alertLogin = true;
        res.redirect('/');
    }
});

app.get('/matrix', (req, res) => {
    if (req.session.loginComplete) {
        res.render('matrix.hbs');
    } else {
        req.session.alertLogin = true;
        res.redirect('/');
    }
});

app.get('/matrix_multiple', (req, res) => {
    if (!req.session.loginComplete) {
        res.render('matrix_multiple.hbs');
    } else {
        req.session.alertLogin = true;
        res.redirect('/');
    }
});

app.post('/sendsms', (req, res) => {
    // https: //www.intellisoftware.co.uk
    //------------------------------------------------------------------comment to test function (don't send a message)---------------------------
    // var intelliSMS = require('intellisms');
    // var sms = new intelliSMS('smsservicehos', 'smsService2017');
    // // console.log(req.body.telno + " " + req.body.msg_data);
    // //number and message 
    // sms.SendMessage({ to: req.body.telno, text: req.body.msg_data }, function(err, id) {
    //     if (err) console.log(err);
    //     console.log(id);
    //     console.log("Send message to " + req.body.fname + " " + req.body.lname + " " + req.body.telno)
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('sendMessageLog').insertOne({
            // no: list.no,
            fname: req.body.fname,
            lname: req.body.lname,
            tel: req.body.telno,
            message: req.body.msg_data,
        }, function(err, result) {
            assert.equal(null, err);
            console.log('Item inserted');
            db.close();
        });
    });
    var errors = false;
    if (errors) {
        req.session.errors = errors;
        req.session.success = false;
    } else {
        req.session.success = true;
    }
    console.log("Send one recipients complete !!!");
    res.redirect('/home');
    // });
    //------------------------------------------------------------------comment to test function (don't send a message)---------------------------
});

app.post('/sendsms2', (req, res) => {
    // https: //www.intellisoftware.co.uk
    //------------------------------------------------------------------comment to test function (don't send a message)---------------------------
    // var intelliSMS = require('intellisms');
    // var sms = new intelliSMS('smsservicehos', 'smsService2017');
    // // console.log(req.body.telno + " " + req.body.msg_data);
    // //number and message 
    // sms.SendMessage({ to: req.body.telno, text: req.body.msg_data }, function(err, id) {
    //     if (err) console.log(err);
    //     console.log(id);
    //     console.log("Send message to " + req.body.fname + " " + req.body.lname + " " + req.body.telno)
    var options = {
        uri: 'https://www.smsmatrix.com/matrix.json',
        method: 'POST',
        json: {
            username: 'smsservice.hospital@gmail.com',
            password: 'smsService2017',
            txt: req.body.msg_data,
            phone: req.body.telno
        }
    };
    
    var request = require('request');
    
    request(options, function(error, response, body) {
        if (!error && (response.statusCode < 400)) {
            console.log(body);
        }
    });
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('sendMessageLog').insertOne({
            // no: list.no,
            fname: req.body.fname,
            lname: req.body.lname,
            tel: req.body.telno,
            message: req.body.msg_data,
        }, function(err, result) {
            assert.equal(null, err);
            console.log('Item inserted');
            db.close();
        });
    });
    var errors = false;
    if (errors) {
        req.session.errors = errors;
        req.session.success = false;
    } else {
        req.session.success = true;
    }
    console.log("Send one recipients complete !!!");
    res.redirect('/home');
    // });
    //------------------------------------------------------------------comment to test function (don't send a message)---------------------------
});

app.get('/smsservice_multiple', (req, res) => {
    if (req.session.loginComplete) {
        res.render('smsservice_multiple.hbs');
    } else {
        req.session.alertLogin = true;
        res.redirect('/');
    }
});

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        // cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
        cb(null, datetimestamp + '-' + file.originalname);
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
                //------------------------------------------------------------------comment to test function (don't send a message)---------------------------
                for (var i = 0; i < result.length; i++) {
                    // var intelliSMS = require('intellisms');
                    // var sms = new intelliSMS('smsservicehos', 'smsService2017');
                    // console.log(req.body.telno + " " + req.body.msg_data);
                    var list = result[i];
                    // console.log(list.fname);
                    // sms.SendMessage({ to: list.tel, text: list.message }, function(err, id) {
                    //     if (err) console.log(err);
                    //     console.log(id);
                    //     // res.redirect('/smsservice');
                    // });  
                }
                result.forEach(function(doc) {
                    MongoClient.connect(url, function(err, db) {
                        assert.equal(null, err);
                        db.collection('sendMessageLog').insert({
                            fname: doc.fname,
                            lname: doc.lname,
                            tel: doc.tel,
                            message: doc.message,
                        }, function(err, result) {
                            assert.equal(null, err);
                            console.log('Item inserted ' + doc.fname);
                            db.close();
                        });
                    });
                });

                //------------------------------------------------------------------comment to test function (don't send a message)---------------------------

                var errors = false;
                if (errors) {
                    req.session.errors = errors;
                    req.session.success = false;
                } else {
                    req.session.success = true;
                }
                console.log("Send multiple recipients complete !!!");
                res.redirect('/home');

            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted excel file" });
        }
    })

});

app.post('/upload2', function(req, res) {
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
                //------------------------------------------------------------------comment to test function (don't send a message)---------------------------
                for (var i = 0; i < result.length; i++) {
                    // var intelliSMS = require('intellisms');
                    // var sms = new intelliSMS('smsservicehos', 'smsService2017');
                    // console.log(req.body.telno + " " + req.body.msg_data);
                    var list = result[i];
                    // console.log(list.fname);
                    // sms.SendMessage({ to: list.tel, text: list.message }, function(err, id) {
                    //     if (err) console.log(err);
                    //     console.log(id);
                    //     // res.redirect('/smsservice');
                    // });  
                    var options = {
                        uri: 'https://www.smsmatrix.com/matrix.json',
                        method: 'POST',
                        json: {
                            username: 'smsservice.hospital@gmail.com',
                            password: 'smsService2017',
                            txt: list.message,
                            phone: list.tel
                        }
                    };
                    console.log(list.message);
                    console.log(list.tel);
                    var request = require('request');
                    
                    request(options, function(error, response, body) {
                        if (error && (response.statusCode < 400)) {
                            console.log(body);
                        }
                    });
                }
                result.forEach(function(doc) {
                    MongoClient.connect(url, function(err, db) {
                        assert.equal(null, err);
                        db.collection('sendMessageLog').insert({
                            fname: doc.fname,
                            lname: doc.lname,
                            tel: doc.tel,
                            message: doc.message,
                        }, function(err, result) {
                            assert.equal(null, err);
                            console.log('Item inserted ' + doc.fname);
                            db.close();
                        });
                    });
                });

                //------------------------------------------------------------------comment to test function (don't send a message)---------------------------

                var errors = false;
                if (errors) {
                    req.session.errors = errors;
                    req.session.success = false;
                } else {
                    req.session.success = true;
                }
                console.log("Send multiple recipients complete !!!");
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
        // console.log(req.body.uname);
        // console.log(req.body.pass);
        var cursor = db.collection('users').find({
            email: req.body.uname
            // pass: req.body.pass
        });
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function() {
            db.close();
            // console.log(resultArray);
            // console.log(resultArray[0].pass);
            // console.log(passwordHash.verify(req.body.pass, resultArray[0].pass));
            if(resultArray != ""){
                var chkPass = passwordHash.verify(req.body.pass, resultArray[0].pass);
                if (!chkPass || (resultArray == "")) {
                    req.session.loginCheck = true;
                    res.redirect('/');
                } else {
                    req.session.loginComplete = true;
                    res.redirect('/home');
                }
            }else{
                req.session.loginCheck = true;
                res.redirect('/');
            }
        });
    });
});

app.post('/regisToDB', (req, res) => {
    var password = passwordHash.generate(req.body.passRegis);
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('users').insertOne({
            fname: req.body.fnameRegis,
            lname: req.body.lnameRegis,
            email: req.body.emailRegis,
            pass: password
        }, function(err, result) {
            assert.equal(null, err);
            req.session.regisComplete = true;
            console.log('Regis complete - insert user to db');
            db.close();
            res.redirect('/');
        });
    });

    // res.redirect('/');
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