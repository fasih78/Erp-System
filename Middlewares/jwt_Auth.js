const Jwt = require("jsonwebtoken");
require('dotenv').config();

const jwtAuth = (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).send({message:"Unauthorized request",success:false});
    }
    
    const token = req.headers["authorization"].split(" ")[1];

    if (!token) {
      return res.status(401).send({message:"Access denied. No token provided.",success:false});
    }
    try {
      const decoded = Jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded.user;
      next();
    } catch (err) {
  
  
      res.status(400).send({message:"Invalid token  and User logout!.",success:false});
    }
  };
  module.exports = jwtAuth ;