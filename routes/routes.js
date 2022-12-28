const express = require('express');
const router = express.Router();
router.post("/action_page", (req, res) => {
    const { fname, lname } = req.body
    addPerson({ fname: fname, lname: lname })


    res.send("/patient")

})
router.get("/patient/:id", (req, res) => {

    id = req.params.id
    getPersonById({ p_id: id }, (x, data) => {

        res.send(`<head></head>
          <body>
          <p>FIRST NAME:${data[0].fname}<br/>
          LAST NAME:${data[0].lname}</p>
          <form action="/updatePatient/${id}" onsubmit="return onSubmit(this)" method="POST">
          <div>
      <canvas id="signature" width="300" height="100"></canvas>
    </div>
    <div>
      <input type="hidden" name="signature" />
    </div>
    <button type="submit">Send</button>
          </form>
          <script>
          var canvas = document.getElementById('signature');
  var ctx = canvas.getContext("2d");
  var drawing = false;
  var prevX, prevY;
  var currX, currY;
  var signature = document.getElementsByName('signature')[0];
  
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mousedown", start);
  
  function start(e) {
    drawing = true;
  }
  
  function stop() {
    drawing = false;
    prevX = prevY = null;
    signature.value = canvas.toDataURL();
  }
  
  function draw(e) {
    if (!drawing) {
      return;
    }
    // Test for touchmove event, this requires another property.
    var clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    var clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    currX = clientX - canvas.offsetLeft;
    currY = clientY - canvas.offsetTop;
    if (!prevX && !prevY) {
      prevX = currX;
      prevY = currY;
    }
  
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  
    prevX = currX;
    prevY = currY;
  }
  
  
          </script>
          </body>
          `)
    })
    // getPerson({})
})
router.post("/updatePatient/:id", (req, res) => {
    sig = req.body.signature;
    setSig({ signature: sig, p_id: req.params.id })
    res.send("DONE BLOB FILE ADDED")
})
module.exports = router;