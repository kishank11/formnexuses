console.log("snksn k")
const mysql = require("mysql2");

console.log("hell")


// const db_config = require("../config/db_config.json");
// var con = mysql.createConnection({
//   "host": "db4free.net",
//   "user": "kishan",
//   "password": "Password@11",
//   "database": "testnexuses",
//   "port": "3306"

// });
//mysql some other conn
// var con = mysql.createConnection({
//   "host": "20.121.66.104",
//   "user": "omni_nex_forms_dbo",
//   "password": "T3sting01nex!",
//   "database": "signature",
//   "port": "3306"

// });

// var con = mysql.createConnection({
//   "host": "20.231.45.2",
//   "user": "nexuses-forms-dbo",
//   "password": "T3sting01nex!",
//   "database": "signature",
//   "port": "3306"

// });
//localhost
var con = mysql.createPool({
  "host": "20.231.45.2",
  "user": "nexuses-forms-dbo",
  "password": "T3sting01nex!",
  "database": "signature",
  "port": "3306",



});



console.log("hjebbsknk")


con.getConnection(function (err, connection) {
  if (err) throw err;

  console.log("Connected to MySQL Server!");
  connection.release();
});


module.exports = con;
