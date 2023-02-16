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
var con = mysql.createConnection({
  "host": "localhost",
  "user": "nexuses-forms-dbo",
  "password": "T3sting01nex!",
  "database": "signature",
  "port": "3306",
  "connectionLimit": 15,
       "queueLimit": 30,
        "acquireTimeout": 1000000



});



console.log("hjebbsknk")

conn = await mysql.getConnection();
// We have error: Can't add new command when connection is in closed state
// I'm attempting to solve it by grabbing a new connection
if (!conn || !conn.connection || conn.connection._closing) {
  winston.info('Connection is in a closed state, getting a new connection');
  await conn.destroy(); // Toast that guy right now
  sleep.sleep(1); // Wait for the connection to be destroyed and try to get a new one, you must wait! otherwise u get the same connection
  conn = await connPool.connection.getConnection(); // get a new one
}

con.connect(function (err) {
  if (err) throw err;

  console.log("Connected to MySQL Server!");
});


module.exports = con;
