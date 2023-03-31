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
    let query = "INSERT INTO nj (id,signatureat,name_of_client, signature, _select, reason_for_audio_only, chart_id, insurance_id, dob, medicare, icd_10, name_of_supervising_physician, co_pay_amount, paid_amount, smoking_history, time_in, adult_psychotherapy, child_psychotherapy, adult_medication_review, child_medication_review, adult_psychiatric_evaluations, child_psychiatric_evaluations, time_out, am_or_pm, insurance_carrier,name_of_thera) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    const x = db.query(query, [data.id, data.signatureat, data.name_of_client, data.signature, data._select, data.reason_for_audio_only, data.chart_id, data.insurance_id, data.dob, data.medicare, data.icd_10, data.name_of_supervising_physician, data.co_pay_amount, data.paid_amount, data.smoking_history, data.time_in, data.adult_psychotherapy, data.child_psychotherapy, data.adult_medication_review, data.child_medication_review, data.adult_psychiatric_evaluations, data.child_psychiatric_evaluations, data.time_out, data.am_or_pm, data.insurance_carrier, data.name_of_thera], function (err, data, fields) {

        if (err) {
            throw err;
        }


    });


}
module.exports = {
    setUserToken, getUserByNamePass, deleteUserToken, setSigP, addPerson, getPersonById
}