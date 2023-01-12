require("dotenv").config();
const express = require("express");
const fs = require("fs");
const { client_model, setClientToken, setUserToken, getUserById, getUserByName } = require("../../models/clients_model");
// const { authToken } = require("../../firebase/firebase");

const jwt = require("jsonwebtoken");

const login = (req, res) => {
  try {

    const {
      tname,
      email,
      password,
      location

    } = req.body;
    if (email != null && password != null && location != null) {



      getUserByName(
        { email: email, password: password, location: location },

        (x, data) => {

          console.log(data);


          var client = data;
          console.log(client);
          if (client.length > 0) {
            // gen token
            console.log("ekk")
            const jwt_token = jwt.sign({ tname: tname, password: password, location: location }, "JJJ", { expiresIn: "1d" });

            console.log(jwt_token);

            //set token
            setUserToken({ jwttoken: jwt_token, id: client[0].id });
            //send token
            res.setHeader("token", `Bearer ${jwt_token}`)

          } else {
            res.json({ error: "User does not exist" });
          }
        }
      );


    } else {
      console.log("NPPP")



      res.json({ error: "Missing login information" });

    }
  } catch (error) {
    console.log(error)
  }

};







// const login = (req, res) => {
//   let credential;
//   const {
//     email,
//     phone,
//     password,
//     provider,
//     accessToken,
//     idToken,
//     providerId,
//     signInMethod,
//   } = req.body;
//   if (provider != null) {
//     var cred = authToken(accessToken, idToken, providerId, signInMethod);
//     console.log(cred);
//     if (cred.status) {
//       client_model.getClientByEmail(
//         { email: cred.email },

//         (x, data) => {
//           console.log(data);
//           var client = JSON.parse(data);
//           console.log(client);
//           if (client.length > 0) {
//             // gen token
//             console.log("ekk")
//             const jwt_token = jwt.sign({ email: cred.email }, "topsecret0012", {});

//             console.log(jwt_token);

//             //set token
//             setClientToken({ token: jwt_token, id: client[0].id });
//             //send token
//             res.json({ token: jwt_token });
//           } else {
//             res.json({ error: "User does not exist", signUp: true });
//           }
//         }
//       );
//     } else {
//       res.json({ error: "Invalid Credentials" });
//     }
//   } else {
//     if (email != null && password != null) {
//     } else if (phone != null && password != null) {
//     } else {
//       res.json({ error: "Missing login information" });
//     }
//   }
// };

module.exports = {
  login: login,
};
