require('dotenv').config()
const express = require('express');
const helmet = require('helmet');

var bodyParser = require('body-parser');
const { addPerson, getPersonById, setSig, getPersonBySig, setSigP, getUserById, setUserToken, getUserByName, deleteUserToken, getUserByNamePass, addUser } = require('./models/clients_model.js');
const router = express.Router();
const app = express();
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const db = require('./utils/mysql_connection');
app.use(helmet({ contentSecurityPolicy: false }));
const PORT = process.env.PORT || 3000;
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
app.use('/', express.static(__dirname + '/'));
app.use('/', express.static(__dirname + '/upload/Allentown/')); // Store static files.
// Store static files.
app.use('/api/v1', require('./client_route_magellan.js'));
app.use('/api/nj', require('./nj'));
app.use('/api/se', require('./se'));
app.use('/api/peer', require('./peer'));
app.use('/api/consent', require('./consent'));
app.use('/api/ibhs', require('./ibhs'));






app.get("/register", (req, res) => {
  console.log(req.cookies)
  const authHeader = req.cookies.token;
  if (authHeader) {
    console.log(req.cookies)
    const token = authHeader.split(" ")[1];
    console.log(token)
    jwt.verify(token, "JJJ", (err, user) => {
      console.log(user)
      if (user.isAdmin == 1 && user.isAdmin != null && user.isAdmin != undefined) {
        res.render("reg.ejs")

      } else {
        res.send(`
      <center>
      <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>YOU ARE NOT AN ADMIN!</h1></div></center>`)

      }

    });

  } else {
    res.send(`
      <center>
      <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>YOU ARE NOT AN LOGGED IN!</h1></div></center>`)

  }

})

app.post("/register", (req, res) => {
  const { tname, email, location, password } = req.body;

  addUser({ tname: tname, email: email, location: location, password }, (x, data) => {

    console.log(`${data}`)
    res.send(`
    <center>
    <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>USER ADDED</h1></div></center>`)
  })

})



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
    res.send(`
    <center>
    <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>PLEASE LOGIN!</h1></div></center>`)
  }

})




app.get("/login", (req, res) => {

  res.render("login")

})

app.post("/login", async (req, res) => {
  try {

    const {
      tname,
      password,
      location, email

    } = req.body;
    if (email != null && password != null && location != null) {


      if (req.cookies.token) {
        const authHeader = req.cookies.token;
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "JJJ", (err, user) => {
          if (err) res.status(403).json("Token is not valid!");
          res.render("home.ejs", { id: user.id, name: user.tname })
          req.user = user;
          console.log(user);

        });
      } else {
        await getUserByNamePass(
          { email: email, password: password, location: location },

          (x, data) => {

            console.log(data);



            var client = data;
            console.log(client);
            if (client != null && client.length > 0) {
              // gen token
              console.log("ekk")
              const jwt_token = jwt.sign({ email: email, password: password, location: location, tname: data[0].tname, isAdmin: client[0].isAdmin }, "JJJ", { expiresIn: "1d" });

              console.log(jwt_token);

              setUserToken({ jwttoken: jwt_token, id: client[0].id });

              //set token

              res.cookie("token", `Bearer ${jwt_token}`, { maxAge: 86400 }) &&
                res.setHeader("token", `Bearer ${jwt_token}`) &&
                res.render("home", { id: data[0].id, name: data[0].tname })

            } else {

              res.send(`<center>
              <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>INVALID CREDENTIALS!</h1></div></center>`)

            }
          }

        );
      }

    } else {
      console.log("NPPP")



      res.send(`<center>
      <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>INVALID CREDENTIALS!</h1></div></center>`)

    }
  } catch (error) {
    console.log(error)
  }

});

app.get("/home", (req, res) => {
  if (req.cookies.token) {
    const authHeader = req.cookies.token;
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "JJJ", (err, user) => {
      if (err) res.status(403).json("Token is not valid!");
      res.render("home.ejs", { id: user.id, name: user.tname })
      req.user = user;
      console.log(user);

    });
  } else {
    res.send("PLEASE LOGIN")
  }
})





app.get("/logout/:id", async (req, res) => {

  console.log(req.params.id)
  res.clearCookie('token', { path: '/' });
  await deleteUserToken({ jwttoken: "", id: req.params.id });
  res.send("You are Logged out!");
  console.log(req.cookies)
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
    clinician_services } = req.body
  let signatureat = new Date();

  console.log(req.body)

  // var base64Data = signature.replace(/^data:image\/png;base64,/, "");

  const x = _select.join(",")
  const y = reason_for_audio_only.join(",")
  const z = county.join(",")
  const p = insurance_carrier.join(",")
  const q = clinician_services.join(",")





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
    signatureat: signatureat,
    id: id1
  })
  // getPersonBySig({ signaturet: req.body.signaturet })



  // if (req.body.signature != null) {
  //   require("fs").writeFile(`${form}${id1}t.png`, base64Data, 'base64', function (err) {
  //     console.log(err);
  //   });
  //   // setSig({ signature: sig1, p_id: req.params.id })
  // }
  res.send(`<p>/patient/${id1}</p>`)




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
  let signaturepat = new Date();

  if (req.body.signaturep != null) {
    setSigP({ signaturep: sig, id: req.params.id, signaturepat: signaturepat })
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
        if (req.cookies.token) {

          const authHeader = req.cookies.token;
          console.log(req.cookies)
          const token = authHeader.split(" ")[1];
          const l = jwt.verify(token, "JJJ")

        }


        pdf.create(data, options).toFile(`encbb${id}.pdf`, function (err, data) {
          if (err) {
            res.send(err);
          } else {
            res.send(`File created successfully <a href="/generateReport/${id}">Click to view!</a>`);

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
          try {


            const authHeader = req.cookies.token;
            console.log(req.cookies)
            const token = authHeader.split(" ")[1];
            var la = jwt.verify(token, "JJJ")




            pdf.create(data, options).toFile(`./upload/${la.location}/${la.tname}encbb${id}${data[0].signaturepat}.pdf`, function (err, data) {
              console.log(la)
              if (err) {
                res.send(`THERE IS AN ERROR ${err}`);

              } else {
                res.send(`File created successfully <a  style="color: grey;" href="/upload/${la.location}/${la.tname}encbb${id}.pdf">Click to view!</a>`);

              }




            })

          } catch (error) {
            console.log(`cookie not found ${error}`)
          }



        }
      });

    })

  }

})
app.get("/test", (req, res) => {
  let aa = `end_date, peer_specialist_hours, agency_name, employee_name, recipient_name, id, insurance, start_date, total_hours_in_all, assigned_specialist, date_mon, start_mon, end_mon, total_hours_mon, contact_code_mon, date_tue, start_tue, end_tue, total_hours_tue, contact_code_tue, date_wed, start_wed, end_wed, total_hours_wed, contact_code_wed, date_thu, start_thu, end_thu, total_hours_thu, contact_code_thu, date_fri, start_fri, end_fri, total_hours_fri, contact_code_fri, date_sat, start_sat, end_sat, total_hours_sat, contact_code_sat, date_sun, start_sun, end_sun, total_hours_sun, contact_code_sun, signaturet, date_signaturet`
  let x = aa.split(",");
  console.log(x.length)




})


app.get('/d', (req, res) => {
  const x = `Allentown,Atlantic City,Bethlehem,Bristol,Camden,Colmar,Ferry_Street,Hazleton,Highland_Park,Chester,Kingston,Northampton,Phillipsburg,Scranton,Tobyhanna,Upper_Darby,Vineland`;
  const s = x.split(",")
  res.send(`${s}`)
  for (i = 0; i <= s.length - 1; i++) {

    var dir = __dirname + `/${s[i]}`;
    if (!fs.existsSync(dir)) {
      console.log("inside")
      fs.mkdirSync(dir);
    }
  }

})

