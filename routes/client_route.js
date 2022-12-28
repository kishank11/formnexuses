const express = require("express");
const router = express.Router();
const { getAllClients, getClientById, addClient } = require("../models/clients_model")
const ClientsBio = require("../controllers/clients/clients_bio");

router.post("/login", ClientsBio.login);

// router.post("/api/v1/get-client-bio", ClientsBio.clientBio);

// router.get("/api/v1/getAllClients",getAllClients);
// router.get("/api/v1/addClient",addClient);
// router.get("/api/v1/getClientById",getClientById);


module.exports = router;
