const express = require ('express');
const  app = express ();
const  fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb();

//Database names
const u_db = "user-info";
const u_cookie = "cookie";

const saltRounds = 10;

app.set ('port' , process.env.PORT || 3005);
app.use ( express.static ( __dirname));

var urlencodedParser = bodyParser.urlencoded({ extended:false });

// landing page (currently login)
app . get ( '/' , function ( req , res ){
    res . set ( 'Content-Type' , 'text/html' );
    // check cookies
    // if no cookies, send login page
    fs.readFile('login.html', function(err, data){
        if (err) throw err;
        else {
            res.send(data);
        }
    })
});

// send sign up page on request
app . get ( '/signup' , function ( req , res ){
    res . set ( 'Content-Type' , 'text/html' );
    fs.readFile('public/signup.html', function(err, data){
        if (err) throw err;
        else {
            res.send(data);
        }
    })
});

// Login GET request
app.get('/attemptLogin', function(req, res){
    var credentials= {
        username:req.query.username,
        password:req.query.password
    }
    // get credentials from database
    // compare
    res.set('Content-Type', 'text/plain');
    if (credentials.username==="name")
    {
        res.send('true')
    }
    else
    {
        res.send("false");
    }
});

// Register POST request (post for security)
app.post('/attemptRegister',urlencodedParser, function(req, res){
    var signUpData = {
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    };
    var newUser = new user(signUpData.username, signUpData.email);
    
})

var handleRegistration = function(code, res){ // code: the result of registration || res: respones object 
  switch (code) {
    case REGISTRATION_SUCCESSFUL:
      res.send('true')
    break;
    case USERNAME_EXISTS:
      res.send('User already exists');
    break;
    case EMAIL_EXISTS:
      res.send('Email already exists');
    break;
    default:
      res.status(500);
      res.end();
  }
}

// search for a location
app.get('/searchLocationString', function(req, res){
    var query = req.query;
    // search for place in database
    // retrieve array of LatLng values
    var beacons = {
        beacons:[
            {lat: 37.721325,
            lng: -122.479749},
            {lat:  37.721516,
            lng:  -122.479545},
            {lat: 37.7214285,
            lng: -122.479691},
            {lat: 37.721400,
            lng: -122.479569}
        ]
    }
    console.log(JSON.stringify(beacons));
    res.end(JSON.stringify(beacons));
})

// custom 404 page
app.use ( function ( req , res ){
    res.type ( 'text/plain' );
    res.status ( 404 );
    res.send ( '404 - Not Found' );
    *
});

app.listen (app.get( 'port' ), function (){
    console.log ('Express started on http://localhost:' +
    app.get ('port') + '; press Ctrl-C to terminate.' );
});


/**
*Class name: User
*Attributes: username,password,email
*Methods:
            generateid(): Creates a unique id for the document before registration (Called within register function)
            register(): Registers the user with given details
*/
function user(username, password, email) {
    this.username = username;
    this.password = password;
    this.email = email;
}

user.prototype.register = function (err) {

    if (err == 0) {
        couch.insert("user-info", {
            _id: this.id,
            username: this.username,
            password: this.password,
            email: this.email
        }).then(({ data, header, status }) => {
            console.log(data);
            console.log(header);
            console.log(status);
        }, err => {
            console.log("Error" + err);
        });


    }
    else if (err == 1) {
        //email already exists
    }
    else if (err == 2) {
        //username already exists
    }

}


//Function to check if user with given email or username exists and passes 1/2/0 to the callback function
//if user with given email exists/username exists/does not exist

user.prototype.checkifExists = function (res, callback) {
    const view_url = "/_design/get-user-email/_view/useremail";
    const option = { key: this.email };
    couch.get(u_db, view_url, option).then(({ data, header, status }) => {
        console.log("\n\n\n\n\nData:" + JSON.stringify(data));
        if (data.rows.length > 0)
            callback(1,data.rows[0].password);
        else {
            couch.get(u_db, "/_design/get-user-username/_view/user-username", { key: this.username }).then(({ data, header, status }) => {
                if (data.rows.length > 0)
                    callback(2,data.rows[0].password);
                else
                    callback(0);
            }, err => {
                console.log("Error: " + err);
            });
        }

    }, err => {
        console.log("Error: " + err);
    });
}

user.prototype.generateid = function () {
    var ids;
    couch.uniqid().then(ids => ids[0]);
    this.id = ids;
}