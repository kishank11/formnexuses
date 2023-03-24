require('dotenv').config()
const { response } = require('express');
const db = require('../utils/mysql_connection');
// setInterval(function () {
//     db.query('SELECT 1');
//     console.log("j")
// }, 2000);

function getUserByNamePass(data, callback) {

    let query = `SELECT * FROM user where tname = ? and password = ? and location = ?;`;
    db.query(query, [data.tname, data.password, data.location], function (err, data, fields) {

        if (err) {
            callback(err, null)

        }

        callback(null, data)

    });
}

function getUserById(data, callback) {

    let query = `SELECT * FROM user where id=?;`;
    db.query(query, [data.id], function (err, data, fields) {
        if (err) {
            callback(err, null)

        }

        callback(null, data)

    });
}



// }
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

// function getUserById(data, callback) {
//     try {
//         let query = "SELECT * FROM user where tname = ? and password = ? and location = ?;";
//         db.query(query, (err, [, fields) => {
//             if (err) {
//                 throw err;
//             }
//             response.json(data);

//         });
//     } catch (err) {
//         throw err;
//     }
// }
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
    let query = "SELECT * FROM ibhs where id = ?";
    db.query(query, [data.id], function (err, data, fields) {

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


function setSig(data, callback) {

    var id = data.id;
    let query = "Update ibhs SET signature = ? where id = ?";
    db.query(query, [data.signature, data.p_id], function (err, data, fields) {
        if (err) {
            throw err;
        }

    });
}

function setSigP(data, callback) {

    var id = data.id;
    let query = "Update ibhs SET signature_mon = ?, signature_tue = ?,signature_wed = ?,signature_thu = ?,signature_fri = ?,signature_sat = ?,signature_sun = ?,signaturepat=? where id = ?";
    db.query(query, [data.signature_mon, data.signature_tue, data.signature_wed, data.signature_thu, data.signature_fri, data.signature_sat, data.signature_sun, data.signaturepat, data.id], function (err, data, fields) {

        if (err) {
            console.log(`${err}`)
        }

    });
}
function setSigS(data, callback) {

    var id = data.id;
    let query = "Update person SET signatures = ? where  id = ?";
    db.query(query, [data.signatures, data.id], function (err, data, fields) {
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
    let query = "INSERT INTO ibhs (service, type_of_service, id, employee_name,recipient_name,plan,end_date, bc_hours,assigned_bc, mt_hours, assigned_mt, school, home, camp, other, assigned_school, assigned_home, assigned_camp, assigned_other, start_date, total_hours_in_all, date_mon, start_mon, end_mon, total_hours_mon, contact_code_mon, date_tue, start_tue, end_tue, total_hours_tue, contact_code_tue, date_wed, start_wed, end_wed, total_hours_wed, contact_code_wed, date_thu, start_thu, end_thu, total_hours_thu, contact_code_thu, date_fri, start_fri, end_fri, total_hours_fri, contact_code_fri, date_sat, start_sat, end_sat, total_hours_sat, contact_code_sat, date_sun, start_sun, end_sun, total_hours_sun, contact_code_sun, signaturet, date_signaturet,signatureat,name_of_client,name_of_thera) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    const x = db.query(query, [data.service, data.type_of_service, data.id, data.employee_name, data.recipient_name, data.plan, data.end_date, data.bc_hours, data.assigned_bc, data.mt_hours, data.assigned_mt, data.school, data.home, data.camp, data.other, data.assigned_school, data.assigned_home, data.assigned_camp, data.assigned_other, data.start_date, data.total_hours_in_all, data.date_mon, data.start_mon, data.end_mon, data.total_hours_mon, data.contact_code_mon, data.date_tue, data.start_tue, data.end_tue, data.total_hours_tue, data.contact_code_tue, data.date_wed, data.start_wed, data.end_wed, data.total_hours_wed, data.contact_code_wed, data.date_thu, data.start_thu, data.end_thu, data.total_hours_thu, data.contact_code_thu, data.date_fri, data.start_fri, data.end_fri, data.total_hours_fri, data.contact_code_fri, data.date_sat, data.start_sat, data.end_sat, data.total_hours_sat, data.contact_code_sat, data.date_sun, data.start_sun, data.end_sun, data.total_hours_sun, data.contact_code_sun, data.signaturet, data.date_signaturet, data.signatureat, data.name_of_client, data.name_of_thera], function (err, data, fields) {
        if (err) {
            console.log(`${err}`)
        }


    });

}
// function addUser(data, callback) {
//     let query = "INSERT INTO `user` ( `tname`, `location`,`password`) VALUES (?,?,?)";

//     const x = db.query(query, [data.tname, data.location, data.password], function (err, data, fields) {
//         if (err) {
//             throw err;
//         }


//     });

// }

module.exports = {
    setUserToken, getUserByNamePass, deleteUserToken, setSigP, addPerson, getPersonById
}