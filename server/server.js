var express = require ('express');
var app = express ();
var fs = require('fs');
var bodyParser = require('body-parser');

const NodeCouchDb=require('node-couchdb');

const couchdb=new NodeCouchDb();


app.set ('port' , process.env.PORT || 3005);

var urlencodedParser = bodyParser.urlencoded({ extended:false });

// landing page (currently login)
app . get ( '/' , function ( req , res ){
    res . set ( 'Content-Type' , 'text/html' );
    fs.readFile('../front-end/login.html', function(err, data){
        if (err) throw err;
        else {
            res.send(data);
        }
    })
});

// attemptLogin AJAX
app.post('/attemptLogin', urlencodedParser, function(req, res){
  var input = {
    username:req.body.username,
    password:req.body.password
  };
    if (input.username==="name"&&input.password==="pass"){
        res.status(200);
        res.end();
    }
    else{
        res.status(300);
        res.end();
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


/**
*Class name: User
*Attributes: username,password,email
*Methods: 
            generateid(): Creates a unique id for the document before registration (Called within register function)
            register(): Registers the user with given details
*
*/
function user(username, password, email) {
    this.username = username;
    this.password = password;
    this.email = email;
}

user.prototype.generateid = function () {
    var ids;
    couch.uniqid().then(ids => ids[0]);
    this.id = ids;
}

user.prototype.register = function () {

    //TODO: check if the user with given details already exists
    this.generateid();
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
