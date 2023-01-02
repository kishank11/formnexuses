const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "JJJ", (err, user) => {
            if (err) res.status(403).json("Token is not valid!");
            req.user = user;
            console.log(user);
            next();
        });
    } else {
        return res.status(401).json("You are not logged in ");
    }
};
module.exports = verifyToken;