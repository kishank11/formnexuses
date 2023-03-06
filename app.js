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






app.get("/register", (req, res) => {
    console.log(req.session.token)
    const authHeader = req.session.token;
    if (authHeader) {
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
        res.send(`
    <center>
    <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;background-color: grey;"><h1>PLEASE LOGIN!</h1></div></center>`)
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

            if (error) throw error;
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
                response.send('Incorrect Username and/or Password and/or Location! ');
            }
            response.end();
        });

    } else {
        response.send('Please enter Username,Location and Password !');

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
        res.send("PLEASE LOGIN")
    }
})





app.get("/logout", async (req, res) => {
    req.session.loggedin = false

    // await deleteUserToken({ jwttoken: "", id: req.params.id });
    res.send("You are Logged out!");
    console.log(req.session)
})


app.post("/action_page", (req, res) => {

    const { name_of_thera,
        name_of_client,
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
        name_of_thera: name_of_thera,
        name_of_client: name_of_client,
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
    // var base64Data = req.body.signature.replace(/^data:image\/png;base64,/, "");

    getPersonById({ id: id }, (x, data) => {
        console.log(data[0])
        res.render("index.ejs", { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, name_of_thera: `${data[0].name_of_thera}` })
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
    res.redirect(`/view/${req.params.id}`)

})
app.get("/view/:id", (req, res) => {
    getPersonById({ id: id }, (x, data) => {
        res.render("final.ejs", { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` })
    })
})

app.get("/generateReport/:id", (req, res) => {
    let id = req.params.id
    getPersonById({ id: id }, (x, data) => {
        ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}`, name_of_thera: `${data[0].name_of_thera}` }, (err, data) => {
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
            ejs.renderFile(path.join(__dirname, './views/', "view.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}`, name_of_thera: `${data[0].name_of_thera}` }, (err, data1) => {
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



                        pdf.create(data1, options).toFile(`./upload/${la.location}/${la.tname}${data[0].name_of_client}encbb${id}${data[0].signatureat}.pdf`, function (err, data2) {
                            console.log(la)
                            if (err) {
                                res.send(`THERE IS AN ERROR ${err}`);

                            } else {
                                res.send(`
                                <center>
                                <hr />
                                <h1>OMNI HEALTH SERVICES CONSENT TO TREATMENT</h1>
                                <a style="color: grey;" href="/home">HOME</a> <br/>
                                <a style="color: grey;" href="/">New Form</a>
                                <hr />
                                File created successfully 
                                <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;">
                                <a  style="color: grey;" href="/upload/${la.location}/${la.tname}${data[0].name_of_client}encbb${id}${data[0].signatureat}.pdf">Click to view!</a>
                                </center>
                                </div>`);

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
                fs.readdir(`${fullPath}/upload/${user.location}/`, (error, files) => {


                    try {
                        console.log(files)
                        const files1 = JSON.stringify(files)
                        console.log(files1)
                        let y = [];
                        files.filter((name) => {
                            y.push(name.match(/Mihir Kishan*/))
                        });
                        let x = []
                        y.forEach((element, i) => {
                            if (element != null)
                                x.push([element.input])

                        })
                        console.log(x)

                        res.render("thera.ejs", { name: user.tname, location: user.location, input: x })
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
                                <a style="color: grey;" href="/home">HOME</a> <br/>
                                <a style="color: grey;" href="/api/se/">New Form</a>
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
app.on('close', function () {
    db.end();
});


