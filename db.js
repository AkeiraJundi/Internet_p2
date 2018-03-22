

const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
    host:'10.11.235.179',
    port:5984,
    protocol:'http'
});

//Database names
const u_db = 'user-info';
const u_cookie = 'cookie';


/**
*Class name: User
*Attributes: username,password,email
*Methods:
            generateid(): Creates a unique id for the document before registration (Called within register function)
            register(): Registers the user with given details
            authenticate(): Authenticate user with given credentials
*
*/


/**
 * @class User
 * Class representing a user
 */
module.exports = class User {
    /**
     * Constructor to create a user object
     * @param {string} username Username of the user
     * @param {string} password Password
     * @param {string} email Email
     */
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    /**
     * Creates a unique id for user to be stored in database when registered
     */
    generateid() {
        var ids;
        couch.uniqid().then(ids => ids[0]);
        this.id = ids;
    }

    /**
     * Function to register a user with given credentials
     * @returns {Promise} res A promise object which returns 'User Registered' if adding user to database was successful and an error message if user with given credentials already exists
     */

    register() {
        return new Promise((resolve, reject) => {
            var status = 'User registered';
            var err = null;

            check_user_exist(this.email, this.username).then(function (result) {
                if (result.data) {
                    if (result.op == 1)
                        reject('User with given email already exists');
                    else
                        reject('User with given Username already exists');
                }
                else {
                    couch.insert('user-info', {
                        _id: this.generateid(),
                        username: this.username,
                        password: this.password,
                        email: this.email
                    }).then(({ data, header, status }) => {
                        console.log(data);
                        console.log(header);
                        console.log(status);
                        resolve(status);
                    }, err => {
                        console.log(error);
                        reject('Internal Error - 500');
                    });
                }
            }).catch(function (error) {
                console.log(error);
                reject('Internal Error - 500');
            });
        });

    }

    /**
     * Function to authenticate user with given credentials
     * @returns {Promise} res Returns a promise object which gives the username of the user if authenticated and a suitable error message if the user is not registered or if the passwords do
     */
    authenticate() {
        
        return new Promise((resolve, reject) => {
            var status = 'User Authenticated';
            var err = null;
            var pass=this.password;
            check_user_exist(this.email, this.username).then( (result) =>{
                if (result.data === null)
                    reject('User with given username/email does not exist');
                else if (result.data.password != pass)
                    reject('Incorrect Password');
                else
                    resolve(result.data.username);
            }).catch(function (err) {
                reject('Internal Error - 500');
            });
        });


    }

}

/**
 * Function to check if a user with given username or email already exists in the database
 * @param {String} email 
 * @param {String} username 
 * @returns {Promise} res A promise object which returns a JSON object consisting of an option message and the user object if the user exists and an error message if user does not exist
 */
function check_user_exist(email, username) {
    const view_url = '/_design/get-user-email/_view/useremail';
    const option = { key: email };
    var a = couch.get(u_db, view_url, option);

    const view_url_2 = '/_design/get-user-username/_view/user-username';
    const option_2 = { key: username };
    var b = couch.get(u_db, view_url_2, option_2);
    var result = null;
    var error;

    var out = new Promise(function (resolve, reject) {
        Promise.all([a, b]).then(function (results) {
            var num = 0;
            var user = null;

            for (var i = 0; i < results.length; i++) {
                element = results[i];
                num++;
                if (user != null)
                    break;
                if (element.data.rows.length > 0) {
                    console.log(element.data.rows[0]);
                    user = {
                        username: element.data.rows[0].value.username,
                        email: element.data.rows[0].value.email,
                        password: element.data.rows[0].value.password
                    };
                }
            }

            result = { op: num, data: user };
            resolve(result);
        }).catch(err => {
            error = err;
            reject(error);
            console.log(err);
        });
    });

    return out;

}



