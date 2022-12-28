require('dotenv').config()
const { response } = require('express');
const db = require('../utils/mysql_connection');
// setInterval(function () {
//     db.query('SELECT 1');
//     console.log("j")
// }, 2000);
function getAllClients(data, callback) {
    try {
        let query = "SELECT * FROM clients";
        db.query(query, (err, data, fields) => {
            if (err) {
                throw err;
            }
            response.json(data);

        });
    } catch (err) {
        throw err;
    }
}

function getClientById(data, callback) {
    let query = "SELECT * FROM clients where id = ?";
    db.query(query, [data.id], function (err, data, fields) {
        if (err) {
            callback(err, null);
        }
        callback(null, data);
    });

}
function getPersonById(data, callback) {
    let query = "SELECT * FROM person where p_id = ?";
    db.query(query, [data.p_id], function (err, data, fields) {
        if (err) {
            callback(err, null);
        }
        callback(null, data);
    });

}
function getPersonBySig(data, callback) {
    let query = "SELECT * FROM person where signature = ?";
    const x = db.query(query, [data.signature], function (err, data, fields) {
        if (err) {
            console.log(err)
            callback(err, null);
        }

    });
    return x;
}


function getClientByEmail(data, callback) {
    let query = "SELECT * FROM clients where email = ?";
    db.query(query, [data.email], function (err, data, fields) {
        if (err) {
            callback(err, null);
        }
        callback(null, data);
    });

}

function setClientToken(data, callback) {
    var newToken = data.token;
    var id = data.id;
    let query = "Update SET jwtToken = ? where id = ?";
    db.query(query, [data.jwtToken, data.id], function (err, data, fields) {
        if (err) {
            throw err;
        }
        response.json(data)
    });
}


function setSig(data, callback) {

    var id = data.id;
    let query = "Update person SET signature = ? where p_id = ?";
    db.query(query, [data.signature, data.p_id], function (err, data, fields) {
        if (err) {
            throw err;
        }

    });
}

function setSigP(data, callback) {

    var id = data.id;
    let query = "Update person SET signaturep = ? where p_id = ?";
    db.query(query, [data.signaturep, data.p_id], function (err, data, fields) {
        if (err) {
            throw err;
        }

    });
}
function addClient(data, callback) {
    let query = "INSERT INTO clients (client_id,full_name, mobile, email, password, notes, profile_photo_link, status, created_at) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(query, [data.client_id, data.full_name, data.mobile, data.email, data.password, data.notes, data.profile_photo_link, data.status, data.created_at], function (err, data, fields) {
        if (err) {
            throw err;
        }
        response.json(data)
    });
}
function addPerson(data, callback) {
    let query = "INSERT INTO person (p_id,fname, lname,signature) VALUES (?,?,?,?)";
    const x = db.query(query, [data.p_id, data.fname, data.lname, data.signature], function (err, data, fields) {
        if (err) {
            throw err;
        }


    });

}


module.exports = {
    getAllClients,
    getClientById, addClient,
    getClientByEmail
    , addPerson, getPersonById, setSig, setSigP, getPersonBySig
}