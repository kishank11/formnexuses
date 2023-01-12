require('dotenv').config()
const express = require('express');
var bodyParser = require('body-parser');
const { setSigP, addPerson, getPersonById } = require('./models/se_models');
const router = express.Router();
const app = express();

const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const db = require('./utils/mysql_connection');

let cookieParser = require('cookie-parser');
app.use(cookieParser());

let ejs = require("ejs");
let pdf = require("html-pdf");
var path = require("path")
var fs = require("fs");

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));   //Parse body request as json.
app.use('/', express.static(__dirname + '/'));

router.get('/', (req, res) => {
    if (req.cookies.token) {

        const authHeader = req.cookies.token;
        console.log(req.cookies)
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "JJJ", (err, user) => {

            req.user = user;
            console.log(user);

        });
        res.sendFile(`${__dirname}/se.html`)
    }
    else {
        res.send(`
      <center>
      <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>PLEASE LOGIN!</h1></div></center>`)
    }

})




router.get("/login", (req, res) => {

    res.render("login")

})

router.post("/login", async (req, res) => {
    try {

        const {
            tname,
            password,
            location

        } = req.body;
        if (tname != null && password != null && location != null) {


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
                    { tname: tname, password: password, location: location },

                    (x, data) => {

                        console.log(data);



                        var client = data;
                        console.log(client);
                        if (client != null && client.length > 0) {
                            // gen token
                            console.log("ekk")
                            const jwt_token = jwt.sign({ tname: tname, password: password, location: location }, "JJJ", { expiresIn: "1d" });

                            console.log(jwt_token);
                            if (!client[0].jwttoken) {
                                setUserToken({ jwttoken: jwt_token, id: client[0].id });
                            }
                            //set token

                            res.cookie("token", `Bearer ${jwt_token}`, { maxAge: 360000 });
                            //send token
                            res.setHeader("token", `Bearer ${jwt_token}`)
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



            res.json({ error: "Missing login information" });

        }
    } catch (error) {
        console.log(error)
    }

});

router.get("/home", (req, res) => {
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





router.get("/logout/:id", async (req, res) => {

    console.log(req.params.id)
    res.clearCookie('token');
    await deleteUserToken({ jwttoken: "", id: req.params.id });
    res.send("You are Logged out!");
})


router.post("/action_page", (req, res) => {

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
        office,
        insurance_carrier,
        assessment_done,
        dora,
        in_treatment,
        referred,
        clinician_services } = req.body
    let signatureat = new Date();

    console.log(req.body)

    // var base64Data = signature.replace(/^data:image\/png;base64,/, "");

    const x = _select?.join(",")
    const y = reason_for_audio_only?.join(",")
    const z = county?.join(",")
    const office1 = office?.join(",");
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
        signatureat: signatureat,
        office: office1,
        id: id1
    })
    // getPersonBySig({ signaturet: req.body.signaturet })



    // if (req.body.signature != null) {
    //   require("fs").writeFile(`${form}${id1}t.png`, base64Data, 'base64', function (err) {
    //     console.log(err);
    //   });
    //   // setSig({ signature: sig1, p_id: req.params.id })
    // }
    res.end(`<p>/api/se/patient/${id1}</p>`)




})

router.get("/patient/:id", (req, res) => {

    id = req.params.id;
    console.log(req.params.id)
    // var base64Data = req.body.signature.replace(/^data:image\/png;base64,/, "");

    getPersonById({ id: id }, (x, data) => {
        console.log(data[0])
        res.render("seindex.ejs", { id: `${data[0].id}`, office: `${data[0].office}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}` })
    })


    // getPerson({})
})

router.post("/patient/:id", (req, res) => {

    sig = req.body.signaturep;
    id = req.params.id;
    let signaturepat = new Date();

    if (req.body.signaturep != null) {
        setSigP({ signaturep: sig, id: req.params.id, signaturepat: signaturepat })
    }
    getPersonById({ id: id }, (x, data) => {
        res.render("sefinal.ejs", { id: `${data[0].id}`, office: `${data[0].office}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` })
    })
})


router.get("/generateReport/:id", (req, res) => {
    let id = req.params.id
    getPersonById({ id: id }, (x, data) => {
        ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, office: `${data[0].office}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` }, (err, data) => {
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
                        res.send(`File created successfully <a href="/generateReport/${id}">Click to view!</a>`);

                    }
                });
            }
        });

    })


})

router.get("/downloadse/:id", (req, res) => {
    if (fs.existsSync(`./se${req.params.id}.pdf`)) {
        res.render("sedownload.ejs", { id: req.params.id })
        console.log("fil ")
    } else {
        let id = req.params.id
        getPersonById({ id: id }, (x, data) => {
            ejs.renderFile(path.join(__dirname, './views/', "seview.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, office: `${data[0].office}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` }, (err, data) => {
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




                        pdf.create(data, options).toFile(`./upload/${la.location}/${la.tname}se${id}${data[0].signaturepat}.pdf`, function (err, data) {
                            console.log(la)
                            if (err) {
                                res.send(`THERE IS AN ERROR ${err}`);

                            } else {
                                res.send(`File created successfully <a  style="color: grey;" href="/upload/${la.location}/${la.tname}se${id}.pdf">Click to view!</a>`);

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

module.exports = router;