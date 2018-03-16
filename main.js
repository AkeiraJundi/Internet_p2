var express = require ('express');
var app = express ();
var fs = require('fs');
var bodyParser = require('body-parser');


app.set ('port' , process.env.PORT || 3005);
app.use ( express.static ( __dirname));

var urlencodedParser = bodyParser.urlencoded({ extended:false });

// landing page (currently login)
app . get ( '/' , function ( req , res ){
    res . set ( 'Content-Type' , 'text/html' );
    fs.readFile('login.html', function(err, data){
        if (err) throw err;
        else {
            res.send(data);
        }
    })
});

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
    // check credentials from database

    console.log(JSON.stringify(credentials));
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
    res.set('Content-type', 'text/plain');
    // check if user name or email exists
    if (signUpData.username==="exists"){
        res.send('User already exists');
    } else if (signUpData.email==="exists"){
        res.send('Email already exists');
    } else {
        res.send('true');
    }

})

// custom 404 page
app.use ( function ( req , res ){
    res.type ( 'text/plain' );
    res.status ( 404 );
    res.send ( '404 - Not Found' );
});

app.listen (app.get( 'port' ), function (){
    console.log ('Express started on http://localhost:' +
    app.get ('port') + '; press Ctrl-C to terminate.' );
    });













///////////////////////////////////////////////////////////////////////////////

var user={username:"username",password:"password",email:"email"};
