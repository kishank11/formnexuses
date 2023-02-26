require('dotenv').config()
const express = require('express');
var bodyParser = require('body-parser');
const { setSigP, addPerson, getPersonById } = require('./models/ibhs_model');
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
    if (req.session.token) {

        const authHeader = req.session.token;
        console.log(req.session)
        const token = req.session
        jwt.verify(token, "JJJ", (err, user) => {

            req.user = user;
            console.log(user);

        });
        res.sendFile(`${__dirname}/ibhs.html`)
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


            if (req.session.token) {
                const authHeader = req.session.token;
                const token = req.session.token
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
    if (req.session.token) {
        const authHeader = req.session.token;
        const token = req.session
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
        name_of_client,
        id,
        employee_name,
        recipient_name, plan,
        end_date,
        bc_hours,
        type_of_service,
        service,
        assigned_bc, mt_hours, assigned_mt, school, home, camp, other, assigned_school, assigned_home, assigned_camp, assigned_other,
        start_date,
        total_hours_in_all,

        date_mon,
        start_mon,
        end_mon,
        total_hours_mon,
        signature_mon,
        contact_code_mon,
        date_tue,
        start_tue,
        end_tue,
        total_hours_tue,
        signature_tue,
        contact_code_tue,
        date_wed,
        start_wed,
        end_wed,
        total_hours_wed,
        signature_wed,
        contact_code_wed,
        date_thu,
        start_thu,
        end_thu,
        total_hours_thu,
        signature_thu,
        contact_code_thu,
        date_fri,
        start_fri,
        end_fri,
        total_hours_fri,
        signature_fri,
        contact_code_fri,
        date_sat,
        start_sat,
        end_sat,
        total_hours_sat,
        signature_sat,
        contact_code_sat,
        date_sun,
        start_sun,
        end_sun,
        total_hours_sun,
        signature_sun,
        contact_code_sun,
        signaturet,
        date_signaturet } = req.body
    let signatureat = new Date();

    console.log(req.body)

    // var base64Data = signature.replace(/^data:image\/png;base64,/, "");

    // const x = _select?.join(",")
    // const y = reason_for_audio_only?.join(",")
    // const z = county?.join(",")
    // const office1 = office?.join(",");
    // const p = insurance_carrier?.join(",")
    // const q = clinician_services?.join(",")





    // console.log(x)
    // console.log(_select)


    const id0 = crypto.randomUUID();
    const id1 = id0.toString()

    console.log(id1.toString())
    // console.log(signature)


    const data = addPerson({
        id: id1,
        name_of_client: name_of_client,
        employee_name: employee_name,
        recipient_name: recipient_name,
        plan: plan,
        service: service,
        end_date: end_date,
        bc_hours: bc_hours,
        type_of_service: type_of_service,
        assigned_bc: assigned_bc, mt_hours: mt_hours, assigned_mt: assigned_mt, school: school, home: home, camp: camp, other: other, assigned_school: assigned_school, assigned_home: assigned_home, assigned_camp: assigned_camp, assigned_other: assigned_other,
        total_hours_in_all: total_hours_in_all,
        start_date: start_date,

        date_mon: date_mon,
        start_mon: start_mon,
        end_mon: end_mon,
        total_hours_mon: total_hours_mon,

        contact_code_mon: contact_code_mon,
        date_tue: date_tue,
        start_tue: start_tue,
        end_tue: end_tue,
        total_hours_tue: total_hours_tue,

        contact_code_tue: contact_code_tue,
        date_wed: date_wed,
        start_wed: start_wed,
        end_wed: end_wed,
        total_hours_wed: total_hours_wed,

        contact_code_wed: contact_code_wed,
        date_thu: date_thu,
        start_thu: start_thu,
        end_thu: end_thu,
        total_hours_thu: total_hours_thu,

        contact_code_thu: contact_code_thu,
        date_fri: date_fri,
        start_fri: start_fri,
        end_fri: end_fri,
        total_hours_fri: total_hours_fri,

        contact_code_fri: contact_code_fri,
        date_sat: date_sat,
        start_sat: start_sat,
        end_sat: end_sat,
        total_hours_sat: total_hours_sat,

        contact_code_sat: contact_code_sat,
        date_sun: date_sun,
        start_sun: start_sun,
        end_sun: end_sun,
        total_hours_sun: total_hours_sun,

        contact_code_sun: contact_code_sun,
        signaturet: signaturet,
        date_signaturet: date_signaturet
        ,
        signatureat: signatureat
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
                                https://omniforms.online/api/ibhs/patient/${id1}
                                </center>
                                </div>`
    )





})

router.get("/patient/:id", (req, res) => {

    id = req.params.id;
    console.log(req.params.id)
    // var base64Data = req.body.signature.replace(/^data:image\/png;base64,/, "");
    res.redirect(`/api/ibhs/view/${req.params.id}`)



    // getPerson({})
})
router.get("/view/:id", (req, res) => {
    getPersonById({ id: id }, (x, data) => {
        console.log(data[0])
        res.render("ibhsindex.ejs", {
            employee_name: data[0].employee_name,
            recipient_name: data[0].recipient_name,
            plan: data[0].plan,
            end_date: data[0].end_date,
            bc_hours: data[0].bc_hours,
            service: data[0].service,
            type_of_service: data[0].type_of_service,
            assigned_bc: data[0].assigned_bc, mt_hours: data[0].mt_hours, assigned_mt: data[0].assigned_mt, school: data[0].school, home: data[0].home, camp: data[0].camp, other: data[0].other, assigned_school: data[0].assigned_school, assigned_home: data[0].assigned_home, assigned_camp: data[0].assigned_camp, assigned_other: data[0].assigned_other, id: data[0].id, start_date: data[0].start_date, total_hours_in_all: data[0].total_hours_in_all, assigned_specialist: data[0].assigned_specialist, date_mon: data[0].date_mon, start_mon: data[0].start_mon, end_mon: data[0].end_mon, total_hours_mon: data[0].total_hours_mon, signature_mon: data[0].signature_mon, contact_code_mon: data[0].contact_code_mon, date_tue: data[0].date_tue, start_tue: data[0].start_tue, end_tue: data[0].end_tue, total_hours_tue: data[0].total_hours_tue, signature_tue: data[0].signature_tue, contact_code_tue: data[0].contact_code_tue, date_wed: data[0].date_wed, start_wed: data[0].start_wed, end_wed: data[0].end_wed, total_hours_wed: data[0].total_hours_wed, signature_wed: data[0].signature_wed, contact_code_wed: data[0].contact_code_wed, date_thu: data[0].date_thu, start_thu: data[0].start_thu, end_thu: data[0].end_thu, total_hours_thu: data[0].total_hours_thu, signature_thu: data[0].signature_thu, contact_code_thu: data[0].contact_code_thu, date_fri: data[0].date_fri, start_fri: data[0].start_fri, end_fri: data[0].end_fri, total_hours_fri: data[0].total_hours_fri, signature_fri: data[0].signature_fri, contact_code_fri: data[0].contact_code_fri, date_sat: data[0].date_sat, start_sat: data[0].start_sat, end_sat: data[0].end_sat, total_hours_sat: data[0].total_hours_sat, signature_sat: data[0].signature_sat, contact_code_sat: data[0].contact_code_sat, date_sun: data[0].date_sun, start_sun: data[0].start_sun, end_sun: data[0].end_sun, total_hours_sun: data[0].total_hours_sun, signature_sun: data[0].signature_sun, contact_code_sun: data[0].contact_code_sun, sigt: data[0].signaturet, date_signaturet: data[0].date_signaturet
        })
    })
})

router.post("/patient/:id", (req, res) => {
    const { signature_mon, signature_tue, signature_wed, signature_thu, signature_fri, signature_sat, signature_sun } = req.body
    console.log(req.body)

    const signaturepat = new Date()

    setSigP({ id: req.params.id, signature_mon: signature_mon, signature_tue: signature_tue, signature_wed: signature_wed, signature_thu: signature_thu, signature_fri: signature_fri, signature_sat: signature_sat, signature_sat: signature_sat, signature_sun: signature_sun, signaturepat: signaturepat })

    getPersonById({ id: req.params.id }, (x, data) => {
        res.render("ibhsfinal.ejs", {
            employee_name: data[0].employee_name,
            recipient_name: data[0].recipient_name,
            plan: data[0].plan,
            end_date: data[0].end_date,
            bc_hours: data[0].bc_hours,
            service: data[0].service,
            type_of_service: data[0].type_of_service,
            assigned_bc: data[0].assigned_bc, mt_hours: data[0].mt_hours, assigned_mt: data[0].assigned_mt, school: data[0].school, home: data[0].home, camp: data[0].camp, other: data[0].other, assigned_school: data[0].assigned_school, assigned_home: data[0].assigned_home, assigned_camp: data[0].assigned_camp, assigned_other: data[0].assigned_other, id: data[0].id, start_date: data[0].start_date, total_hours_in_all: data[0].total_hours_in_all, assigned_specialist: data[0].assigned_specialist, date_mon: data[0].date_mon, start_mon: data[0].start_mon, end_mon: data[0].end_mon, total_hours_mon: data[0].total_hours_mon, signature_mon: data[0].signature_mon, contact_code_mon: data[0].contact_code_mon, date_tue: data[0].date_tue, start_tue: data[0].start_tue, end_tue: data[0].end_tue, total_hours_tue: data[0].total_hours_tue, signature_tue: data[0].signature_tue, contact_code_tue: data[0].contact_code_tue, date_wed: data[0].date_wed, start_wed: data[0].start_wed, end_wed: data[0].end_wed, total_hours_wed: data[0].total_hours_wed, signature_wed: data[0].signature_wed, contact_code_wed: data[0].contact_code_wed, date_thu: data[0].date_thu, start_thu: data[0].start_thu, end_thu: data[0].end_thu, total_hours_thu: data[0].total_hours_thu, signature_thu: data[0].signature_thu, contact_code_thu: data[0].contact_code_thu, date_fri: data[0].date_fri, start_fri: data[0].start_fri, end_fri: data[0].end_fri, total_hours_fri: data[0].total_hours_fri, signature_fri: data[0].signature_fri, contact_code_fri: data[0].contact_code_fri, date_sat: data[0].date_sat, start_sat: data[0].start_sat, end_sat: data[0].end_sat, total_hours_sat: data[0].total_hours_sat, signature_sat: data[0].signature_sat, contact_code_sat: data[0].contact_code_sat, date_sun: data[0].date_sun, start_sun: data[0].start_sun, end_sun: data[0].end_sun, total_hours_sun: data[0].total_hours_sun, signature_sun: data[0].signature_sun, contact_code_sun: data[0].contact_code_sun, sigt: data[0].signaturet, date_signaturet: data[0].date_signaturet
        })
    })
})




router.post("/downloadibhs/:id", (req, res) => {
    if (fs.existsSync(`./peer${req.params.id}.pdf`)) {
        res.render("ibhsdownload.ejs", { id: req.params.id })
        console.log("fil ")
    } else {
        let id = req.params.id
        getPersonById({ id: id }, (x, data) => {
            ejs.renderFile(path.join(__dirname, './views/', "ibhsview.ejs"), {
                employee_name: data[0].employee_name,
                recipient_name: data[0].recipient_name,
                plan: data[0].plan,
                end_date: data[0].end_date,
                bc_hours: data[0].bc_hours,
                service: data[0].service,
                type_of_service: data[0].type_of_service,
                assigned_bc: data[0].assigned_bc, mt_hours: data[0].mt_hours, assigned_mt: data[0].assigned_mt, school: data[0].school, home: data[0].home, camp: data[0].camp, other: data[0].other, assigned_school: data[0].assigned_school, assigned_home: data[0].assigned_home, assigned_camp: data[0].assigned_camp, assigned_other: data[0].assigned_other, signature_mon: `${data[0].signature_mon}`, signature_tue: `${data[0].signature_tue}`, signature_wed: `${data[0].signature_wed}`, signature_thu: `${data[0].signature_thu}`, signature_fri: `${data[0].signature_fri}`, signature_sat: `${data[0].signature_sat}`, signature_sun: `${data[0].signature_sun}`, id: data[0].id, start_date: data[0].start_date, total_hours_in_all: data[0].total_hours_in_all, assigned_specialist: data[0].assigned_specialist, date_mon: data[0].date_mon, start_mon: data[0].start_mon, end_mon: data[0].end_mon, total_hours_mon: data[0].total_hours_mon, signature_mon: data[0].signature_mon, contact_code_mon: data[0].contact_code_mon, date_tue: data[0].date_tue, start_tue: data[0].start_tue, end_tue: data[0].end_tue, total_hours_tue: data[0].total_hours_tue, signature_tue: data[0].signature_tue, contact_code_tue: data[0].contact_code_tue, date_wed: data[0].date_wed, start_wed: data[0].start_wed, end_wed: data[0].end_wed, total_hours_wed: data[0].total_hours_wed, signature_wed: data[0].signature_wed, contact_code_wed: data[0].contact_code_wed, date_thu: data[0].date_thu, start_thu: data[0].start_thu, end_thu: data[0].end_thu, total_hours_thu: data[0].total_hours_thu, signature_thu: data[0].signature_thu, contact_code_thu: data[0].contact_code_thu, date_fri: data[0].date_fri, start_fri: data[0].start_fri, end_fri: data[0].end_fri, total_hours_fri: data[0].total_hours_fri, signature_fri: data[0].signature_fri, contact_code_fri: data[0].contact_code_fri, date_sat: data[0].date_sat, start_sat: data[0].start_sat, end_sat: data[0].end_sat, total_hours_sat: data[0].total_hours_sat, signature_sat: data[0].signature_sat, contact_code_sat: data[0].contact_code_sat, date_sun: data[0].date_sun, start_sun: data[0].start_sun, end_sun: data[0].end_sun, total_hours_sun: data[0].total_hours_sun, signature_sun: data[0].signature_sun, contact_code_sun: data[0].contact_code_sun, sigt: data[0].signaturet, date_signaturet: data[0].date_signaturet
            }, (err, data) => {
                if (err) {
                    console.log(`${err}`)
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
                        console.log(req.session)
                        const token = req.session
                        var la = jwt.verify(token, "JJJ")




                        pdf.create(data, options).toFile(`./${la.location}/${la.tname}ibhs${id}.pdf`, function (err, data) {
                            console.log(la)
                            if (err) {
                                res.send(`THERE IS AN ERROR ${err}`);

                            } else {
                                res.send(`File created successfully <a  style="color: grey;" href="/${la.location}/${la.tname}ibhs${id}.pdf">Click to view!</a>`);

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


router.get("/downloadibhs/:id", (req, res) => {

    if (fs.existsSync(`./peer${req.params.id}.pdf`)) {
        res.render("ibhsdownload.ejs", { id: req.params.id })
        console.log("fil ")
    } else {

        let id = req.params.id
        getPersonById({ id: id }, (x, data) => {
            // (async () => {
            //     const authHeader = req.session.token;
            //     console.log(req.session)
            //     const token = req.session
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
            ejs.renderFile(path.join(__dirname, './views/', "ibhsview.ejs"), {
                employee_name: data[0].employee_name,
                recipient_name: data[0].recipient_name,
                plan: data[0].plan,
                end_date: data[0].end_date,
                bc_hours: data[0].bc_hours,
                service: data[0].service,
                type_of_service: data[0].type_of_service,
                assigned_bc: data[0].assigned_bc, mt_hours: data[0].mt_hours, assigned_mt: data[0].assigned_mt, school: data[0].school, home: data[0].home, camp: data[0].camp, other: data[0].other, assigned_school: data[0].assigned_school, assigned_home: data[0].assigned_home, assigned_camp: data[0].assigned_camp, assigned_other: data[0].assigned_other, signature_mon: `${data[0].signature_mon}`, signature_tue: `${data[0].signature_tue}`, signature_wed: `${data[0].signature_wed}`, signature_thu: `${data[0].signature_thu}`, signature_fri: `${data[0].signature_fri}`, signature_sat: `${data[0].signature_sat}`, signature_sun: `${data[0].signature_sun}`, id: data[0].id, start_date: data[0].start_date, total_hours_in_all: data[0].total_hours_in_all, assigned_specialist: data[0].assigned_specialist, date_mon: data[0].date_mon, start_mon: data[0].start_mon, end_mon: data[0].end_mon, total_hours_mon: data[0].total_hours_mon, signature_mon: data[0].signature_mon, contact_code_mon: data[0].contact_code_mon, date_tue: data[0].date_tue, start_tue: data[0].start_tue, end_tue: data[0].end_tue, total_hours_tue: data[0].total_hours_tue, signature_tue: data[0].signature_tue, contact_code_tue: data[0].contact_code_tue, date_wed: data[0].date_wed, start_wed: data[0].start_wed, end_wed: data[0].end_wed, total_hours_wed: data[0].total_hours_wed, signature_wed: data[0].signature_wed, contact_code_wed: data[0].contact_code_wed, date_thu: data[0].date_thu, start_thu: data[0].start_thu, end_thu: data[0].end_thu, total_hours_thu: data[0].total_hours_thu, signature_thu: data[0].signature_thu, contact_code_thu: data[0].contact_code_thu, date_fri: data[0].date_fri, start_fri: data[0].start_fri, end_fri: data[0].end_fri, total_hours_fri: data[0].total_hours_fri, signature_fri: data[0].signature_fri, contact_code_fri: data[0].contact_code_fri, date_sat: data[0].date_sat, start_sat: data[0].start_sat, end_sat: data[0].end_sat, total_hours_sat: data[0].total_hours_sat, signature_sat: data[0].signature_sat, contact_code_sat: data[0].contact_code_sat, date_sun: data[0].date_sun, start_sun: data[0].start_sun, end_sun: data[0].end_sun, total_hours_sun: data[0].total_hours_sun, signature_sun: data[0].signature_sun, contact_code_sun: data[0].contact_code_sun, sigt: data[0].signaturet, date_signaturet: data[0].date_signaturet
            }, (err, data1) => {
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
                        console.log(req.session)
                        const token = req.session.token
                        var la = jwt.verify(token, "JJJ")



                        pdf.create(data1, options).toFile(`./upload/${la.location}/${la.tname}${data[0].name_of_client}ibhs${id}${data[0].signatureat}.pdf`, function (err, data2) {
                            console.log(la)
                            if (err) {
                                res.send(`THERE IS AN ERROR ${err}`);

                            } else {
                                res.send(`
                                <center>
                                <hr />
                                <h1>OMNI HEALTH SERVICES CONSENT TO TREATMENT</h1>
                                <a style="color: grey;" href="/home">HOME</a> <br/>
                                <a style="color: grey;" href="/api/ibhs/">New Form</a>
                                <hr />
                                File created successfully 
                                <div style="margin-top: 300px; margin-left: 300px; margin-right: 300px;">
                                <a  style="color: grey;" href="/upload/${la.location}/${la.tname}${data[0].name_of_client}ibhs${id}${data[0].signatureat}.pdf">Click to view!</a>
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
// router.get("/downloadibhs/:id", (req, res) => {
//     if (fs.existsSync(`./peer${req.params.id}.pdf`)) {
//         res.render("ibhsdownload.ejs", { id: req.params.id })
//         console.log("fil ")
//     } else {
//         let id = req.params.id
//         getPersonById({ id: id }, (x, data) => {
//             ejs.renderFile(path.join(__dirname, './views/', "ibhsview.ejs"), {
//     employee_name: data[0].employee_name,
//     recipient_name: data[0].recipient_name,
//     plan: data[0].plan,
//     end_date: data[0].end_date,
//     bc_hours: data[0].bc_hours,
//     service: data[0].service,
//     type_of_service: data[0].type_of_service,
//     assigned_bc: data[0].assigned_bc, mt_hours: data[0].mt_hours, assigned_mt: data[0].assigned_mt, school: data[0].school, home: data[0].home, camp: data[0].camp, other: data[0].other, assigned_school: data[0].assigned_school, assigned_home: data[0].assigned_home, assigned_camp: data[0].assigned_camp, assigned_other: data[0].assigned_other, signature_mon: `${data[0].signature_mon}`, signature_tue: `${data[0].signature_tue}`, signature_wed: `${data[0].signature_wed}`, signature_thu: `${data[0].signature_thu}`, signature_fri: `${data[0].signature_fri}`, signature_sat: `${data[0].signature_sat}`, signature_sun: `${data[0].signature_sun}`, id: data[0].id, start_date: data[0].start_date, total_hours_in_all: data[0].total_hours_in_all, assigned_specialist: data[0].assigned_specialist, date_mon: data[0].date_mon, start_mon: data[0].start_mon, end_mon: data[0].end_mon, total_hours_mon: data[0].total_hours_mon, signature_mon: data[0].signature_mon, contact_code_mon: data[0].contact_code_mon, date_tue: data[0].date_tue, start_tue: data[0].start_tue, end_tue: data[0].end_tue, total_hours_tue: data[0].total_hours_tue, signature_tue: data[0].signature_tue, contact_code_tue: data[0].contact_code_tue, date_wed: data[0].date_wed, start_wed: data[0].start_wed, end_wed: data[0].end_wed, total_hours_wed: data[0].total_hours_wed, signature_wed: data[0].signature_wed, contact_code_wed: data[0].contact_code_wed, date_thu: data[0].date_thu, start_thu: data[0].start_thu, end_thu: data[0].end_thu, total_hours_thu: data[0].total_hours_thu, signature_thu: data[0].signature_thu, contact_code_thu: data[0].contact_code_thu, date_fri: data[0].date_fri, start_fri: data[0].start_fri, end_fri: data[0].end_fri, total_hours_fri: data[0].total_hours_fri, signature_fri: data[0].signature_fri, contact_code_fri: data[0].contact_code_fri, date_sat: data[0].date_sat, start_sat: data[0].start_sat, end_sat: data[0].end_sat, total_hours_sat: data[0].total_hours_sat, signature_sat: data[0].signature_sat, contact_code_sat: data[0].contact_code_sat, date_sun: data[0].date_sun, start_sun: data[0].start_sun, end_sun: data[0].end_sun, total_hours_sun: data[0].total_hours_sun, signature_sun: data[0].signature_sun, contact_code_sun: data[0].contact_code_sun, sigt: data[0].signaturet, date_signaturet: data[0].date_signaturet
// }, (err, data) => {
//                 if (err) {
//                     console.log(`${err}`)
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
//                         const token = req.session
//                         var la = jwt.verify(token, "JJJ")




//                         pdf.create(data, options).toFile(`./upload/${la.location}/${la.tname}ibhs${id}${data[0].signaturepat}.pdf`, function (err, data) {
//                             console.log(la)
//                             if (err) {
//                                 res.send(`THERE IS AN ERROR ${err}`);

//                             } else {
//                                 res.send(`File created successfully <a  style="color: grey;" href="/upload/${la.location}/${la.tname}ibhs${id}.pdf">Click to view!</a>`);

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

module.exports = router;