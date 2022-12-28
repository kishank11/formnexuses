console.log("snksn k")
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config({ path: '.env-dev' })
console.log("hell")


// const db_config = require("../config/db_config.json");
var con = mysql.createConnection({
  "host": "db4free.net",
  "user": "kishan",
  "password": "Password@11",
  "database": "testnexuses",
  "port": "3306"

});



console.log("hjebbsknk")
console.log(process.env.USER);
con.connect(function (err) {
  if (err) throw err;

  console.log("Connected to MySQL Server!");
});


module.exports = con;
