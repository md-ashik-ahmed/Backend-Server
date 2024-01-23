require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.verifyJwtToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.send("token is not valid");
  }
  try {
    let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded._id;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send("Access denied. Invalid token.");
  }
};
