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
    let query = "SELECT * FROM nj where id = ?";
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
    let query = "Update nj SET signaturep = ? , signaturepat = ? where id = ?";
    db.query(query, [data.signaturep, data.signaturepat, data.id], function (err, data, fields) {
        if (err) {
            throw err;
        }

    });
}
function addPerson(data, callback) {
    let query = "INSERT INTO nj (id, _select, reason_for_audio_only, chart_id, insurance_id, dob, consumer_name, icd_10, medicare, name_of_supervising_physician, co_pay_amount, paid_amount, time_in, time_out, am_or_pm, city, insurance_carrier,smoking_history,adult_psychotherapy, child_psychotherapy, adult_medication_review, child_medication_review, adult_psychiatric_evaluations, child_psychiatric_evaluations, signature,signatureat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?);";
    const x = db.query(query, [data.id, data._select, data.reason_for_audio_only, data.chart_id, data.insurance_id, data.dob, data.consumer_name, data.icd_10, data.medicare, data.name_of_supervising_physician, data.co_pay_amount, data.paid_amount, data.time_in, data.time_out, data.am_or_pm, data.city, data.insurance_carrier, data.smokinghistory, data.clinician_services, data.medical_services, data.signature, data.signatureat], function (err, data, fields) {
        if (err) {
            throw err;
        }


    });

}
module.exports = {
    setUserToken, getUserByNamePass, deleteUserToken, setSigP, addPerson, getPersonById
}