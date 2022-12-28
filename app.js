require('dotenv').config()
const express = require('express');
var bodyParser = require('body-parser');
const { addPerson, getPersonById, setSig, getPersonBySig, setSigP } = require('./models/clients_model.js');
const router = express.Router();
const app = express();
const PORT = 3000;
app.listen(PORT);
var path = require("path")
var fs = require("fs")
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));   //Parse body request as json.
app.use('/', express.static(__dirname + '/')); // Store static files.
// app.use('/api/v1', require('./routes/client_route.js'));

app.get('/', function (request, response) {
  response.sendFile(`${__dirname}/htmlPage.html`);

});
app.post("/action_page", (req, res) => {
  const { p_id, fname, lname, signature } = req.body
  console.log(req.body)

  var base64Data = signature.replace(/^data:image\/png;base64,/, "");


  const data = addPerson({ p_id: p_id, fname: fname, lname: lname, signature: signature })
  getPersonBySig({ signature: signature })



  if (req.body.signature != null) {
    require("fs").writeFile(`${p_id}.jpeg`, base64Data, 'base64', function (err) {
      console.log(err);
    });
    // setSig({ signature: sig1, p_id: req.params.id })
  }
  res.end(`<p>https://formnexuses.onrender.com/patient/${p_id}</p>`)




})

app.get("/patient/:id", (req, res) => {

  id = req.params.id;
  console.log(id)

  getPersonById({ p_id: id }, (x, data) => {

    res.render("index.ejs", { x: `../${req.params.id}.jpeg`, y: `${data[0].fname}`, z: `${data[0].lname}`, id: `${data[0].p_id}` })
  })


  // getPerson({})
})
app.post("/patient/:id", (req, res) => {
  sig = req.body.signaturep;
  id = req.params.id;
  var base64Data = req.body.signaturep.replace(/^data:image\/png;base64,/, "");
  if (req.body.signaturep != null) {
    require("fs").writeFile(`${req.params.id}.png`, base64Data, 'base64', function (err) {
      console.log(err);
    });
    setSigP({ signaturep: sig, p_id: req.params.id })
  }
  getPersonById({ p_id: id }, (x, data) => {

    res.render("final.ejs", { x: `../${req.params.id}.jpeg`, y: `${data[0].fname}`, z: `${data[0].lname}`, id: `${data[0].p_id}`, g: `../${req.params.id}.png` })

  })



})

// app.get("/patient/view/:id", (req, res) => {
//   const id = req.params.id

//   getPersonById({ p_id: id }, (x, data) => {

//     res.render("final", { x: `../${req.params.id}.jpeg`, y: `${data[0].fname}`, z: `${data[0].lname}`, id: `${data[0].p_id}`, g: `../${req.params.id}.png` })

//   })
// })


// app.post("/updatePatient/:id", (req, res) => {
//   console.log(req.body)
//   sig = req.body.signature;
//   var base64Data = req.body.signature.replace(/^data:image\/png;base64,/, "");
//   console.log(base64Data);
//   require("fs").writeFile(`${req.params.id}.png`, base64Data, 'base64', function (err) {
//     console.log(err);
//   });
//   setSig({ signature: sig, p_id: req.params.id })
//   res.render("index", { x: `../${req.params.id}.png` })
// })

// app.get("/getPatient/:id", (req, res) => {
//   res.render("index.ejs", { x: `../${req.params.id}.png` })

// })

