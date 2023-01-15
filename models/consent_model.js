require('dotenv').config()

const db = require('../utils/mysql_connection');

function getUserByNamePass(data, callback) {

    let query = `SELECT * FROM user where tname = ? and password = ? and location = ?;`;
    db.query(query, [data.tname, data.password, data.location], function (err, data, fields) {
        if (err) {
            callback(err, null)

        }

        callback(null, data)

    });
}

function getPersonById(data, callback) {
    let query = "SELECT * FROM consent where id = ?";
    db.query(query, [data.id], function (err, data, fields) {
        if (err) {
            callback(err, null);
        }
        callback(null, data);
    });

}

function setUserToken(data, callback) {
    var newToken = data.token;
    var id = data.id;
    let query = "Update user SET jwttoken = ? where id = ?;";
    db.query(query, [data.jwttoken, data.id], function (err, data, fields) {
        if (err) {
            throw err;
        }

    });
}

function deleteUserToken(data, callback) {
    var newToken = data.token;
    var id = data.id;
    let query = "Update user SET jwttoken = ? where id = ?;";
    db.query(query, [data.jwttoken, data.id], function (err, data, fields) {
        if (err) {
            throw err;
        }

    });
}

function setSigP(data, callback) {

    var id = data.id;
    let query = "Update consent SET signaturep = ? , signaturepat = ? where id = ?";
    db.query(query, [data.signaturep, data.signaturepat, data.id], function (err, data, fields) {
        if (err) {
            throw err;
        }

    });
}
function addPerson(data, callback) {
    let query = "INSERT INTO consent(id,name_of_client,agree,program,signature,signatureat) VALUES (?,?,?,?,?,?);";
    const x = db.query(query, [data.id, data.name_of_client, data.agree, data.program, data.signature, data.signatureat], function (err, data, fields) {
        if (err) {
            throw err;
        }


    });

}
module.exports = {
    setUserToken, getUserByNamePass, deleteUserToken, setSigP, addPerson, getPersonById
}