
const express = require("express");
const { login } = require("../controllers/clients/clients_bio");
const router = express.Router();



router.post("/login", login);

// router.post("/api/v1/get-client-bio", ClientsBio.clientBio);

// router.get("/api/v1/getAllClients",getAllClients);
// router.get("/api/v1/addClient",addClient);
// router.get("/api/v1/getClientById",getClientById);


module.exports = router;
