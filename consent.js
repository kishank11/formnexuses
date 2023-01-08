require('dotenv').config()
const express = require('express');
var bodyParser = require('body-parser');
const { setSigP, addPerson, getPersonById } = require('./models/consent_model');
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
        res.sendFile(`${__dirname}/consent.html`)
    }
    else {
        res.send("PLEASE LOGIN ")
    }




});


// router.get("/view/:id", (req, res) => {
//     const id = req.params.id
//     getPersonById({ id: id }, (x, data) => {
//         res.render("view.ejs", { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, county: `${data[0].county}`, insurance_carrier: `${data[0].insurance_carrier}`, assessment_done: `${data[0].assessment_done}`, dora: `${data[0].dora}`, in_treatment: `${data[0].in_treatment}`, referred: `${data[0].referred}`, clinician_services: `${data[0].clinician_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` })
//     })
// })

// router.get("/pdf/:id", async (req, res) => {
//     const id = req.params.id;

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.goto(`http://localhost:3000/api/v1/view/${id}`, {
//         waitUntil: 'networkidle2'
//     });

//     const pdf = await page.pdf({
//         path: `mag${id}.pdf`,
//         displayHeaderFooter: true,
//         printBackground: false,
//         height: "11.25in",

//         width: "8.5in",

//     });

//     await browser.close();

//     res.contentType("application/pdf");
//     res.send(pdf);
// });




router.post("/action_page", (req, res) => {

    const {
        signature,
        name_of_client,
        program,
        agree


    } = req.body
    console.log(req.body)

    // var base64Data = signature.replace(/^data:image\/png;base64,/, "");

    const x = program?.join(",");










    console.log(x)



    const id0 = crypto.randomUUID();
    const id1 = id0.toString()

    console.log(id1.toString())
    // console.log(signature)

    let signatureat = new Date();
    const data = addPerson({

        name_of_client: name_of_client,
        signature: signature,
        signatureat: signatureat,
        agree: agree,
        program: x,
        id: id1
    })
    // getPersonBySig({ signaturet: req.body.signaturet })



    // if (req.body.signature != null) {
    //   require("fs").writeFile(`${form}${id1}t.png`, base64Data, 'base64', function (err) {
    //     console.log(err);
    //   });
    //   // setSig({ signature: sig1, p_id: req.params.id })
    // }
    res.end(`<p>https://formnexuses.onrender.com/api/consent/patient/${id1}</p>`)




})

router.get("/patient/:id", (req, res) => {

    id = req.params.id;
    console.log(req.params.id)
    // var base64Data = req.body.signature.replace(/^data:image\/png;base64,/, "");

    getPersonById({ id: id }, (x, data) => {
        console.log(data[0])
        res.render("consentindex.ejs", { id: `${data[0].id}`, agree: `${data[0].agree}`, name_of_client: `${data[0].name_of_client}`, program: `${data[0].program}`, sigt: `${data[0].signature}` })
    })



})

router.post("/patient/:id", (req, res) => {
    let signaturepat = new Date();

    sig = req.body.signaturep;
    id = req.params.id;

    if (req.body.signaturep != null) {
        setSigP({ signaturep: sig, signaturepat: signaturepat, id: req.params.id })
    }
    getPersonById({ id: id }, (x, data) => {
        console.log(data[0])
        res.render("consentfinal.ejs", { id: `${data[0].id}`, agree: `${data[0].agree}`, name_of_client: `${data[0].name_of_client}`, program: `${data[0].program}`, sigt: `${data[0].signature}` })
    })
})


// // router.get("/generateReport/:id", (req, res) => {
// //     let id = req.params.id
// //     getPersonById({ id: id }, (x, data) => {
// //         ejs.renderFile(path.join(__dirname, './views/', "magview.ejs"), { id: `${data[0].id}`, _select: `${data[0]._select}`, reason_for_audio_only: `${data[0].reason_for_audio_only}`, chart_id: `${data[0].chart_id}`, insurance_id: `${data[0].insurance_id}`, dob: `${data[0].dob}`, consumer_name: `${data[0].consumer_name}`, icd_10: `${data[0].icd_10}`, medicare: `${data[0].medicare}`, name_of_supervising_physician: `${data[0].name_of_supervising_physician}`, co_pay_amount: `${data[0].co_pay_amount}`, paid_amount: `${data[0].paid_amount}`, id: `${data[0].id}`, time_in: `${data[0].time_in}`, time_out: `${data[0].time_out}`, am_or_pm: `${data[0].am_or_pm}`, city: `${data[0].city}`, insurance_carrier: `${data[0].insurance_carrier}`, smoking_history: `${data[0].smoking_history}`, clinician_services: `${data[0].clinician_services}`, medical_services: `${data[0].medical_services}`, sigt: `${data[0].signature}`, sigtp: `${data[0].signaturep}` }, (err, data) => {
// //             if (err) {
// //                 res.send(err);
// //             } else {
// //                 let options = {
// //                     "height": "11.25in",
// //                     "width": "8.5in",
// //                     "header": {
// //                         "height": "20mm"
// //                     },
// //                     "footer": {
// //                         "height": "20mm",
// //                     },
// //                 };


// //                 pdf.create(data, options).toFile(`mag${id}.pdf`, function (err, data) {
// //                     if (err) {
// //                         res.send(err);
// //                     } else {
// //                         res.send(`File created successfully <a style="color: grey;" href="https://formnexuses.onrender.com/generateReport/${id}">Click to view!</a>`);

// //                     }
// //                 });
// //             }
// //         });

// //     })


// })

router.get("/downloadconsent/:id", (req, res) => {
    if (fs.existsSync(`./consent${req.params.id}.pdf`)) {
        res.render("consentdownload.ejs", { id: req.params.id })
        console.log("fil ")
    } else {
        let id = req.params.id
        getPersonById({ id: id }, (x, data) => {
            ejs.renderFile(path.join(__dirname, './views/', "consentview.ejs"), { id: `${data[0].id}`, agree: `${data[0].agree}`, name_of_client: `${data[0].name_of_client}`, program: `${data[0].program}`, sigt: `${data[0].signature}` }, (err, data) => {
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


                    pdf.create(data, options).toFile(`consent${id}.pdf`, function (err, data) {
                        if (err) {
                            res.send(`THERE IS AN ERROR ${err}`);
                        } else {
                            res.contentType('html');
                            res.send(`File created successfully <a style="color: grey;" href="https://formnexuses.onrender.com/consent${id}.pdf">Click to view!</a> `);

                        }
                    });
                }
            });

        })

    }

})

// router.post("/api/v1/get-client-bio", ClientsBio.clientBio);

// router.get("/api/v1/getAllClients",getAllClients);
// router.get("/api/v1/addClient",addClient);
// router.get("/api/v1/getClientById",getClientById);


module.exports = router;
