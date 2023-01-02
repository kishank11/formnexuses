require('dotenv').config()
const express = require('express');
var bodyParser = require('body-parser');
const { addPerson, getPersonById, setSig, getPersonBySig, setSigP, getUserById, setUserToken, getUserByName, deleteUserToken, getUserByNamePass } = require('./models/clients_model.js');
const router = express.Router();
const app = express();
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const db = require('./utils/mysql_connection');
const PORT = 3000;
app.listen(PORT);
let cookieParser = require('cookie-parser');
app.use(cookieParser());
const form = "encbb"
let ejs = require("ejs");
let pdf = require("html-pdf");
var path = require("path")
var fs = require("fs");
const { group } = require('console');
const verifyToken = require('./middleware/verifytoken.js');
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));   //Parse body request as json.
app.use('/', express.static(__dirname + '/')); // Store static files.
app.use('/api/v1', require('./routes/client_route.js'));





app.get('/', (req, res) => {
  if (req.cookies.token) {

    const authHeader = req.cookies.token;
    console.log(req.cookies)
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "JJJ", (err, user) => {

      req.user = user;
      console.log(user);

    });
    res.sendFile(`${__dirname}/htmlPage.html`)
  }
  else {
    res.send("PLEASE LOGIN ")
  }




});

app.get("/login", (req, res) => {

  res.render("login")

})
app.post("/login", async (req, res) => {
  try {

    const {
      tname,
      password,
      location

    } = req.body;
    if (tname != null && password != null && location != null) {



      await getUserByNamePass(
        { tname: tname, password: password, location: location },

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
            res.cookie("token", `Bearer ${jwt_token}`, { maxAge: 360000 });
            //send token
            res.setHeader("token", `Bearer ${jwt_token}`)
            res.render("home", { id: data[0].id, name: data[0].tname })

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

});







app.get("/logout/:id", async (req, res) => {

  console.log(req.params.id)
  await deleteUserToken({ jwttoken: "", id: req.params.id });
  res.send("You are Logged out!");
})


app.post("/action_page", (req, res) => {

  const {
    signature,
    _select,
    reason_for_audio_only,
    chart_id,
    insurance_id,
    dob,
    consumer_name,
    county,
    medicare,
    icd_10,
    name_of_supervising_physician,
    co_pay_amount,
    paid_amount,
    time_in,
    time_out,
    am_or_pm,
    insurance_carrier,
    assessment_done,
    dora,
    in_treatment,
    referred,
    clinician_services, } = req.body
  console.log(req.body)

  // var base64Data = signature.replace(/^data:image\/png;base64,/, "");

  const x = _select?.join(",")
  const y = reason_for_audio_only?.join(",")
  const z = county?.join(",")
  const p = insurance_carrier?.join(",")
  const q = clinician_services?.join(",")





  console.log(x)
  console.log(_select)


  const id0 = crypto.randomUUID();
  const id1 = id0.toString()

  console.log(id1.toString())
  // console.log(signature)


  const data = addPerson({

    _select: x,
    reason_for_audio_only: y,
    chart_id: chart_id,
    insurance_id: insurance_id,
    dob: dob,
    consumer_name: consumer_name,
    medicare: medicare,
    name_of_supervising_physician: name_of_supervising_physician,
    co_pay_amount: co_pay_amount,
    paid_amount: paid_amount,
    time_in: time_in,
    time_out: time_out,
    am_or_pm: am_or_pm,
    icd_10: icd_10,
    county: z,
    insurance_carrier: p,
    assessment_done: assessment_done,
    dora: dora,
    in_treatment: in_treatment,
    referred: referred,
    clinician_services: q,
    signature: signature,
    id: id1
  })
  // getPersonBySig({ signaturet: req.body.signaturet })



  // if (req.body.signature != null) {
  //   require("fs").writeFile(`${form}${id1}t.png`, base64Data, 'base64', function (err) {
  //     console.log(err);
  //   });
  //   // setSig({ signature: sig1, p_id: req.params.id })
  // }
  res.end(`<p>https://formnexuses.onrender.com/patient/${id1}</p>`)




})

app.get("/patient/:id", (req, res) => {

  id = req.params.id;
  console.log(req.params.id)
  // var base64Data = req.body.signature.replace(/^data:image\/png;base64,/, "");

  getPersonById({ id: id }, (x, data) => {
    console.log(data[0])
    res.render("index.ejs", { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}` })
  })


  // getPerson({})
})

app.post("/patient/:id", (req, res) => {

  sig = req.body.signaturep;
  id = req.params.id;

  if (req.body.signaturep != null) {
    setSigP({ signaturep: sig, id: req.params.id })
  }
  getPersonById({ id: id }, (x, data) => {
    res.render("final.ejs", { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` })
  })
})


app.get("/generateReport/:id", (req, res) => {
  let id = req.params.id
  getPersonById({ id: id }, (x, data) => {
    ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` }, (err, data) => {
      if (err) {
        res.send(err);
      } else {
        let options = {
          "height": "11.25in",
          "width": "8.5in",
          "header": {
            "height": "20mm"
          },
          "footer": {
            "height": "20mm",
          },
        };


        pdf.create(data, options).toFile(`encbb${id}.pdf`, function (err, data) {
          if (err) {
            res.send(err);
          } else {
            res.send(`File created successfully <a href="https://formnexuses.onrender.com/generateReport/${id}">Click to view!</a>`);

          }
        });
      }
    });

  })


})

app.get("/downloadencbb/:id", (req, res) => {
  if (fs.existsSync(`./encbb${req.params.id}.pdf`)) {
    res.render("download.ejs", { id: req.params.id })
    console.log("fil ")
  } else {
    let id = req.params.id
    getPersonById({ id: id }, (x, data) => {
      ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` }, (err, data) => {
        if (err) {
          res.send(err);
        } else {
          let options = {
            "height": "11.25in",
            "width": "8.5in",
            "header": {
              "height": "20mm"
            },
            "footer": {
              "height": "20mm",
            },
          };


          pdf.create(data, options).toFile(`encbb${id}.pdf`, function (err, data) {
            if (err) {
              res.send(err);
            } else {
              res.send(`File created successfully <a href="https://formnexuses.onrender.com/downloadencbb/${id}">Click to view!</a>`);

            }
          });
        }
      });

    })

  }

})

