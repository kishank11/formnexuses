const https = require("https");
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
var bodyParser = require('body-parser');
const { addPerson, getPersonById, setSig, getPersonBySig, setSigP, getUserById, setUserToken, getUserByName, deleteUserToken, getUserByNamePass, addUser } = require('./models/clients_model.js');
const router = express.Router();
const app = express();
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const db = require('./utils/mysql_connection');
var path = require("path")
var fs = require("fs");
const async = require("async")
const PORT = process.env.PORT || 1337;
// let cookieParser = require('cookie-parser');
// app.use(cookieParser());
const fullPath = path.join(__dirname)

fs.readdirSync(fullPath, (error, files) => {
    if (error) console.log(error)
    files.forEach(element => {
        console.log(element)
    });
})

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
var options = {
    key: fs.readFileSync('./ssl/omniforms_online.key'),
    cert: fs.readFileSync('./ssl/omniforms_online.crt'),
    ca: fs.readFileSync('./ssl/omniforms_online.ca-bundle')
};
var httpsport = 1337;
var server = https.createServer(options, app).listen(httpsport, function () {
    console.log("Express server listening on port " + httpsport);
});

const form = "encbb"
let ejs = require("ejs");
let pdf = require("html-pdf");

const { group } = require('console');
const verifyToken = require('./middleware/verifytoken.js');
const { ifError } = require("assert");
const { promise } = require("./utils/mysql_connection");
const { promisify } = require("util");

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));   //Parse body req as json.
app.use('/', express.static(__dirname + '/'));
app.use('/', express.static(__dirname + '/upload/Allentown/')); // Store static files.
// Store static files.
app.use('/api/v1', require('./client_route_magellan.js'));
app.use('/api/nj', require('./nj'));
app.use('/api/se', require('./se'));
app.use('/api/peer', require('./peer'));
app.use('/api/consent', require('./consent'));
app.use('/api/ibhs', require('./ibhs'));


app.get("/edit/:id", (req, res) => {

    res.render("editpass.ejs", { id: req.params.id })


})

app.post("/edit/:id", (req, res) => {

    query = `Update user set password = "${req.body.password}" where id=${req.params.id}`
    db.query(query, function (err, data, fields) {
        if (err) {
            throw err;

        }
        if (data.length != 0) {
            res.setHeader("content-type", 'text/html')
            res.write(`
            
            <center>
    <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>PASSWORD CHANGED!!</h1></div></center>
            `)

        }




    })

})

app.get("/admin", (req, res) => {
    console.log(req.session.token)
    const authHeader = req.session.token;
    if (authHeader) {
        console.log(req.session)
        const token = authHeader;
        console.log(token)
        jwt.verify(token, "JJJ", (err, user) => {
            console.log(user)
            if (user.isAdmin == 1 && user.isAdmin != null && user.isAdmin != undefined) {

                query = `SELECT * from user`
                db.query(query, function (err, data, fields) {
                    if (err) {
                        throw err;

                    }
                    if (data.length != 0) {
                        res.setHeader("content-type", 'text/html')
                        data.forEach((data) => {
                            res.write(`<table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/edit/${data.id}">${data.email}<a></td><td>${data.tname}</td><td>${data.location}</td></tr></table>`)
                        })

                    }
                    else {
                        res.send("NOTHING TO DOWNLOAD")
                    }



                })





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



app.get("/register", (req, res) => {
    console.log(req.session.token)
    const authHeader = req.session.token;
    if (req.session.loggedin) {
        console.log(req.session)
        const token = authHeader;
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
    if (req.session.token) {

        const authHeader = req.session.token;
        console.log(req.session)
        const token = authHeader
        jwt.verify(token, "JJJ", (err, user) => {

            req.user = user;
            console.log(user);

        });
        res.sendFile(`${__dirname}/htmlPage.html`)
    }
    else {
        res.render("welcome.ejs");
    }

})



app.get("/login", (req, res) => {

    if (req.session.loggedin) {

        if (req.session.token) {
            const authHeader = req.session.token;

            jwt.verify(req.session.token, "JJJ", (err, user) => {
                if (err) res.status(403).json("Token is not valid!");
                res.render("home.ejs", { id: user.id, name: user.tname })
                req.user = user;
                console.log(user);

            });
        } else {

        }

    } else {
        res.render("login")
    }
})
app.post('/login', function (req, response) {
    // Capture the input fields

    let password = req.body.password;
    let email = req.body.email;
    let location = req.body.location;

    // Ensure the input fields exists and are not empty
    if (password && email && location) {
        // Execute SQL query that'll select the account from the database based on the specified username and password

        db.query('SELECT * FROM user WHERE password = ? AND email = ? AND location = ?', [password, email, location], function (error, data, fields) {
            // If there is an issue with the query, output the error

            if (error) {
                response.send(`
                <center>
                <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>SESSION EXPIRED LOG IN AGAIN</h1></div></center>`)

            }
            // If the account exists

            if (data.length > 0) {
                console.log(`${data[0]}slmalma`)
                const jwt_token = jwt.sign({ id: data[0].id, email: email, password: password, location: location, tname: data[0].tname, isAdmin: data[0].isAdmin }, "JJJ", {});

                // Authenticate the user
                req.session.loggedin = true;
                req.session.token = `${jwt_token}`;
                // Redirect to home page
                response.redirect('/home');
            } else {
                response.send(`
                <center>
                <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>INVALID CREDENTIALS</h1></div></center>`)

            }
            response.end();
        });

    } else {
        response.send(`
        <center>
        <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>PLEASE ENTER DETAILS!</h1></div></center>`)


    }
});



app.get("/home", (req, res) => {
    console.log(req.session.token)
    if (req.session.loggedin) {
        const authHeader = req.session.token;

        jwt.verify(req.session.token, "JJJ", (err, user) => {
            if (err) res.status(403).json("Token is not valid!");
            res.render("home.ejs", { id: user.id, name: user.tname })
            req.user = user;
            console.log(user);

        });
    } else {
        res.send(`
    <center>
    <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>PLEASE LOGIN!</h1></div></center>`)
    }
})





app.get("/logout", async (req, res) => {
    req.session.loggedin = false

    // await deleteUserToken({ jwttoken: "", id: req.params.id });

    res.send(`
    <center>
    <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>You are Logged out!!</h1></div></center>`)

    console.log(req.session)
})


app.post("/action_page", (req, res) => {

    const {
        name_of_client,
        signature,
        _select,
        reason_for_audio_only,
        chart_id,
        insurance_id,
        dob,

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

    console.log(signatureat)
    console.log(req.body)
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")
    const name_of_thera = la.tname
    // var base64Data = signature.replace(/^data:image\/png;base64,/, "");

    const x = _select != null ? _select : "-"
    const y = reason_for_audio_only != null ? reason_for_audio_only : "-"
    const z = county != null ? county : "-"
    const p = insurance_carrier != null ? insurance_carrier?.join(",") : "-"
    const q = clinician_services != null ? clinician_services?.join(",") : "-"

    const assessment_done1 = assessment_done != null ? assessment_done : "-"
    const dora1 = dora != null ? dora : "-"
    const in_treatment1 = in_treatment != null ? in_treatment : "-"
    const referred1 = referred != null ? referred : "-"




    console.log(x)



    const id0 = crypto.randomUUID();
    const id1 = id0.toString()

    console.log(id1.toString())
    // console.log(signature)


    const data = addPerson({
        name_of_thera: name_of_thera,
        name_of_client: name_of_client,
        _select: x,
        reason_for_audio_only: y,
        chart_id: chart_id,
        insurance_id: insurance_id,
        dob: dob,

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
        assessment_done: assessment_done1,
        dora: dora1,
        in_treatment: in_treatment1,
        referred: referred1,
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
    res.end(`<p>
    <center>
                                <hr />
                                <h1>OMNI HEALTH SERVICES CONSENT TO TREATMENT</h1>
                                <a style="color: grey;" href="/home">HOME</a> <br/>
                                <a style="color: grey;" href="/api/se/">New Form</a>
                                <hr />
                                PLEASE COPY AND PASTE THE LINK BELOW IN ZOOM CALL
                                <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;">
                                https://omniforms.online/patient/${id1}
                                </center>
                                </div>`
    )





})

app.get("/patient/:id", (req, res) => {

    id = req.params.id;
    console.log(req.params.id)
    if (id != null) {
        db.query(`SELECT * FROM encbb where id = ?;`, [id], function (error, data, fields) {

            if (data.length > 0) {
                console.log(data[0])
                res.render("index.ejs", { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, name_of_thera: `${data[0].name_of_thera}`, name_of_client: `${data[0].name_of_client}` })

            } else {
                res.send(`
            <center>
            <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>FORM DID NOT SAVE IN THE DATABASE.PLEASE FILL AGAIN</h1></div></center>`)

            }

        })

    } else {
        res.send(`
        <center>
        <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>FORM DID NOT SAVE IN THE DATABASE.PLEASE FILL AGAIN</h1></div></center>`)
    }
})

app.post("/patient/:id", (req, res) => {

    sig = req.body.signaturep;
    id = req.params.id;
    let signaturepat = new Date();


    if (req.body.signaturep != null) {
        setSigP({ signaturep: sig, id: req.params.id, signaturepat: signaturepat })
    }
    res.redirect(`/view/${req.params.id}`)

})
app.get("/view/:id", (req, res) => {
    id = req.params.id;
    console.log(req.params.id)
    if (id != null) {

        db.query(`SELECT * FROM encbb where id = ?;`, [id], function (error, data, fields) {
            if (data.length > 0) {
                console.log(data[0])
                res.render("final.ejs", { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}`, name_of_thera: `${data[0].name_of_thera}`, name_of_client: `${data[0].name_of_client}`, signatureat: `${data[0].signatureat}`, signaturepat: `${data[0].signaturepat}` })

            } else {
                res.send(`
        <center>
        <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>PLEASE REFRESH THE PAGE</h1></div></center>`)

            }


        })

    } else {
        res.send(`
        <center>
        <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>FORM DID NOT SAVE IN THE DATABASE.PLEASE FILL AGAIN</h1></div></center>`)
    }




})

app.get("/generateReport/:id", (req, res) => {
    let id = req.params.id
    getPersonById({ id: id }, (x, data) => {
        ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}`, name_of_thera: `${data[0].name_of_thera}`, signatureat: `${data[0].signatureat}`, signaturepat: `${data[0].signaturepat}` }, (err, data) => {
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
                if (req.session.token) {

                    const authHeader = req.session.token;
                    console.log(req.session)
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
        res.render("encbbdownload.ejs", { id: req.params.id })
        console.log("fil ")
    } else {

        let id = req.params.id
        getPersonById({ id: id }, (x, data) => {
            // (async () => {
            //     const authHeader = req.session.token;
            //     console.log(req.session)
            //     const token = authHeader.split(" ")[1];
            //     var la = jwt.verify(token, "JJJ")
            //     const browser = await puppeteer.launch({
            //         executablePath: '../../chrome/chrome',
            //         headless: true,
            //         args: ['--use-gl=egl'],
            //     });
            //     const page = await browser.newPage();
            //     await page.goto(`/api/consent/view/${id}`);
            //     await page.screenshot({ path: `./upload/${la.location}/${la.tname}consent${id}${data[0].signatureat}.pdf` });

            //     await browser.close();
            //     var file = fs.createReadStream(`./upload/${la.location}/${la.tname}consent${id}${data[0].signatureat}.pdf`);
            //     var stat = fs.statSync(`./upload/${la.location}/${la.tname}consent${id}${data[0].signatureat}.pdf`);
            //     res.setHeader('Content-Length', stat.size);
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
            //     file.pipe(res);
            // })();
            ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}`, name_of_thera: `${data[0].name_of_thera}`, name_of_client: `${data[0].name_of_client}`, signatureat: `${data[0].signatureat}`, signaturepat: `${data[0].signaturepat}` }, (err, data1) => {
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


                        const authHeader = req.session.token;
                        console.log(req.session.token)
                        const token = req.session.token
                        var la = jwt.verify(token, "JJJ")



                        pdf.create(data1, options).toFile(`./upload/${la.location}/${la.tname}_${data[0].name_of_client}encbb${id}${data[0].signatureat}.pdf`, function (err, data2) {
                            console.log(la)
                            if (err) {
                                res.send(`THERE IS AN ERROR ${err}`);

                            } else {
                                let query = `Update ibhs SET flag = ? where id = ?`
                                db.query(query, [1, id], function (err, data, fields) {
                                    if (err) {
                                        throw err;
                                    }
                                })
                                res.send(`
                                <center>
                                <hr />
                                <h1>OMNI HEALTH SERVICES CONSENT TO TREATMENT</h1>
                                <a style="color: grey;" href="/home">HOME</a> <br/>
                                <a style="color: grey;" href="/">New Form</a>
                                <hr />
                                File sent successfully 
                                <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;">
                                
                                </center>
                                </div>`);

                            }


                        })

                    } catch (error) {
                        promisify.
                            console.log(`cookie not found ${error}`)
                    }
                }
            });

        })

    }

})

// app.get("/downloadencbb/:id", (req, res) => {
//     if (fs.existsSync(`./encbb${req.params.id}.pdf`)) {
//         res.render("download.ejs", { id: req.params.id })
//         console.log("fil ")
//     } else {
//         let id = req.params.id
//         getPersonById({ id: id }, (x, data) => {
//             ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` }, (err, data) => {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     let options = {
//                         "height": "11.25in",
//                         "width": "8.5in",
//                         "header": {
//                             "height": "20mm"
//                         },
//                         "footer": {
//                             "height": "20mm",
//                         },
//                     };
//                     try {


//                         const authHeader = req.session.token;
//                         console.log(req.session)
//                         const token = authHeader.split(" ")[1];
//                         var la = jwt.verify(token, "JJJ")




//                         pdf.create(data, options).toFile(`./upload/${la.location}/${la.tname}encbb${id}${data[0].signaturepat}.pdf`, function (err, data) {
//                             console.log(la)
//                             if (err) {
//                                 res.send(`THERE IS AN ERROR ${err}`);

//                             } else {
//                                 res.send(`File created successfully <a  style="color: grey;" href="/upload/${la.location}/${la.tname}encbb${id}.pdf">Click to view!</a>`);

//                             }




//                         })

//                     } catch (error) {
//                         console.log(`cookie not found ${error}`)
//                     }



//                 }
//             });

//         })

//     }

// })

app.get("/therapist/consent", (req, res) => {
    name = "consent"
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")


    let query = `SELECT * FROM ${name} where name_of_thera = ? and flag = ?;`
    db.query(query, [la.tname, 0], function (err, data, fields) {
        if (err) {
            throw err;

        }
        if (data.length != 0) {

            console.log(data)
            res.setHeader("content-type", 'text/html')
            data.forEach((data) => {
                res.write(`<center><table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/api/consent/downloadconsent/${data.id}">${data.name_of_thera}<a></td></tr></table>`)
            })
        }
        else {
            res.send("NOTHING TO DOWNLOAD")
        }



    })

})


app.get("/therapist/encbb", (req, res) => {
    name = "encbb"
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")
    let query = `SELECT * FROM ${name} where name_of_thera = ? and flag = ?;`

    db.query(query, [la.tname, 0], function (err, data, fields) {
        if (err) {
            throw err;

        }
        if (data.length != 0) {
            res.setHeader("content-type", 'text/html')
            data.forEach((data) => {
                res.write(`<table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/downloadencbb/${data.id}">${data.name_of_thera}<a></td></tr></table>`)
            })

        }
        else {
            res.send("NOTHING TO DOWNLOAD")
        }



    })

})
app.get("/therapist/mag", (req, res) => {
    name = "mag"
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")
    let query = `SELECT * FROM ${name} where name_of_thera = ? and flag = ?;`
    db.query(query, [la.tname, 0], function (err, data, fields) {
        if (err) {
            throw err;

        }
        if (data.length != 0) {

            res.setHeader("content-type", 'text/html')
            data.forEach((data) => {
                res.write(`<center><table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/api/v1/downloadmag/${data.id}">${data.name_of_thera}<a></td></tr></table>`)
            })

        }
        else {
            res.send("NOTHING TO DOWNLOAD")
        }





    })

})
app.get("/therapist/nj", (req, res) => {
    name = "nj"
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")
    let query = `SELECT * FROM ${name} where name_of_thera = ? and flag = ?;`
    db.query(query, [la.tname, 0], function (err, data, fields) {
        if (err) {
            throw err;

        }
        if (data.length != 0) {

            res.setHeader("content-type", 'text/html')
            data.forEach((data) => {
                res.write(`<center><table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/api/nj/downloadnj/${data.id}">${data.name_of_thera}<a></td></tr></table>`)
            })

        }
        else {
            res.send("NOTHING TO DOWNLOAD")
        }






    })

})
app.get("/therapist/se", (req, res) => {
    name = "se"
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")
    let query = `SELECT * FROM ${name} where name_of_thera = ? and flag = ?;`
    db.query(query, [la.tname, 0], function (err, data, fields) {
        if (err) {
            throw err;

        }


        if (data.length != 0) {

            res.setHeader("content-type", 'text/html')
            data.forEach((data) => {
                res.write(`<center><table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/api/se/downloadse/${data.id}">${data.name_of_thera}<a></td></tr></table>`)
            })

        }
        else {
            res.send("NOTHING TO DOWNLOAD")
        }





    })

})
app.get("/therapist/peer", (req, res) => {
    name = "peer"
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")
    let query = `SELECT * FROM ${name} where name_of_thera = ? and flag = ?;`
    db.query(query, [la.tname, 0], function (err, data, fields) {
        if (err) {
            throw err;

        }
        console.log(data)
        if (data.length != 0) {
            res.setHeader("content-type", 'text/html')
            data.forEach((data) => {
                res.write(`<center><table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/api/peer/downloadpeer/${data.id}">${data.name_of_thera}<a></td></tr></table>`)
            })

        }
        else {
            res.send("NOTHING TO DOWNLOAD")
        }





    })

})
app.get("/therapist/ibhs", (req, res) => {
    name = "ibhs"
    const authHeader = req.session.token;
    console.log(req.session.token)
    const token = req.session.token
    var la = jwt.verify(token, "JJJ")

    let query = `SELECT * FROM ${name} where name_of_thera = ? and flag = ?;`
    db.query(query, [la.tname, 0], function (err, data, fields) {
        if (err) {
            throw err;

        }

        if (data.length != 0) {

            res.setHeader("content-type", 'text/html')
            data.forEach((data) => {
                res.write(`<center><table border="1"><tr><td>${data.id}</td><td><a style=" color:grey;" href="/api/ibhs/downloadibhs/${data.id}">${data.name_of_thera}<a></td></tr></table>`)
            })

        }
        else {
            res.send("NOTHING TO DOWNLOAD")
        }






    })

})


app.get("/therapist", (req, res) => {
    console.log(req.session)
    const authHeader = req.session.token;
    if (authHeader) {
        console.log(req.session)
        const token = authHeader;
        console.log(token)
        jwt.verify(token, "JJJ", (err, user) => {
            console.log(user);
            if (user) {
                console.log(fullPath)
                fs.readdir(`${fullPath}/upload/${user.location}/`, async (error, files) => {





                    try {




                        let y = [];
                        var dirPath = `${fullPath}/upload/${user.location}/`;
                        // this will get you list of all files. in directory
                        var files = fs.readdirSync(dirPath);
                        var objToReturn = {};
                        // then using async do like this
                        var data = [];
                        async.eachSeries(files, function (file, callback) {
                            var filePath = path.join(dirPath, file);
                            const dnt = fs.stat(filePath, function (err, stats) {
                                // write stats data into objToReturn 

                                callback(null, data.push({

                                    name: file,
                                    time: stats.mtime.getTime()
                                }));

                            });


                        }, function (err) {

                            console.log(data)
                            const files1 = data;
                            const files2 =
                                files1.sort((a, b) => b.time - a.time)
                                    .map(file => file.name);
                            const x1 = `${user.tname}`
                            files2.filter((name1) => {

                                y.push(name1.match(x1))
                            });
                            // console.log(y)
                            let x = []
                            y.forEach((element, i) => {
                                // console.log(element)
                                if (element != null)
                                    x.push([element.input])

                            })
                            console.log(x)

                            res.render("thera.ejs", { name: user.tname, location: user.location, input: x })
                            // final callback when all files completed here send objToReturn to client
                        });



                        // };


                        // const files1 = await getSortedFiles();

                        // const files1 = Object.values(files2.name)

                    } catch (error) {
                        console.log(error)
                    }

                })
                // const x = await fetch(`/${user.location}/`);
                // x.forEach(element => {
                //     console.log(element)
                // });


            } else {

                res.end(`<p>
                         <center>
                                <hr />
                                <h1>OMNI HEALTH SERVICES CONSENT TO TREATMENT</h1>
                                
                                <hr />
                                
                                <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;">
                                
                                </center>
                                </div>`
                )
            }
        }
        )
    }

})
app.get("/test", (req, res) => {
    let aa = `data.id, data._select, data.reason_for_audio_only, data.chart_id, data.insurance_id, data.dob, data.consumer_name, data.icd_10, data.medicare, data.name_of_supervising_physician, data.co_pay_amount, data.paid_amount, data.time_in, data.time_out, data.am_or_pm, data.city, data.insurance_carrier, data.smokinghistory, data.clinician_services, data.medical_services, data.signature, data.signatureat, data.name_of_client, data.name_of_thera`
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

app.get("/hello", (req, res) => {
    const arr = "data.id, data._select, data.reason_for_audio_only, data.office, data.chart_id, data.insurance_id, data.dob, data.consumer_name, data.icd_10, data.medicare, data.name_of_supervising_physician, data.co_pay_amount, data.paid_amount, data.time_in, data.time_out, data.am_or_pm, data.county, data.insurance_carrier, data.assessment_done, data.dora, data.in_treatment, data.referred, data.clinician_services, data.signature, data.signatureat, data.name_of_client, data.name_of_thera";
    const ss = arr.split(",")
    console.log(ss.length)
    ss.forEach((data) => {
        console.log(`ALTER TABLE nj ALTER COLUMN ${data} SET DEFAULT '-';`)
    })
})
app.on('close', function () {
    db.end();
});



// if (data.length > 0) {

// } else {
//     res.send(`
// <center>
// <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>FORM DID NOT SAVE IN THE DATABASE.PLEASE FILL AGAIN</h1></div></center>`)

// }