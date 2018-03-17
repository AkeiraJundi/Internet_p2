var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');

const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb();

//Database names
const u_db = "user-info";
const u_cookie = "cookie";


/**
*Class name: User
*Attributes: username,password,email
*Methods:
            generateid(): Creates a unique id for the document before registration (Called within register function)
            register(): Registers the user with given details
*
*/

var User=class User{
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    generateid = function () {
        var ids;
        couch.uniqid().then(ids => ids[0]);
        this.id = ids;
    }

    register() {
        const res = new Promise((resolve, reject) => {
            var status = "User registered";
            var err;
            check_user_exist(this.email, this.username).then(({ op, user }) => {
                if (op == 1)
                    err = "User with email already exists";
                else if (op == 2)
                    err = "User with username already exists";
            }, err => {
                couch.insert("user-info", {
                    _id: this.generateid(),
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

            });

            if (!err)
                resolve(status);
            else
                reject(err);
        });

        return res;
    }

    authenticate(){
        const res = new Promise((resolve, reject) => {
            var status = "User Authenticated";
            var err;
            check_user_exist(this.email, this.username).then(({ op, user }) => {
                if(user.password!=this.password)
                    err="Incorrect Password";
            }, err => {
                err="Username/email does not exist";
            });

            if (!err)
                resolve(status);
            else
                reject(err);
        });

        return res;
    }

}


check_user_exist = function (email, username) {
    const res = new Promise((resolve, reject) => {
        var status;
        var err = "User does not exist";
        const view_url = "/_design/get-user-email/_view/useremail";
        const option = { key: email };
        couch.get(u_db, view_url, option).then(({ data, header, status }) => {
            if (data.rows.length > 0)
                status = { op: 1, data: new User(email, data.rows[0].username, data.rows[0].password) };
            else {
                couch.get(u_db, "/_design/get-user-username/_view/user-username", { key: username }).then(({ data, header, status }) => {
                    if (data.rows.length > 0)
                        status = { op: 2, data: new user(data.rows[0].email, username, data.rows[0].password) };
                }, err => {
                    console.log("Error: " + err);
                });
            }

        }, err => {
            console.log("Error: " + err);
        });

        if (!status)
            reject(err);
        else
            resolve(status);
    });

    return res;
}





module.exports=User;
