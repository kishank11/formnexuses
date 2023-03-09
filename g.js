const { SignaturePad } = require("signature_pad")

const x = () => {

    var canvas = document.getElementById("signature");

    var signature = document.getElementsByName("signature")[0];
    console.log(signature)
    const signaturePad = new SignaturePad(canvas);
    console.log(signaturePad)
    signature = signaturePad.toDataURL();
    return signature;
}

module.exports = x;