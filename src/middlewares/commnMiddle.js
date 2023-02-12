const jwt = require("jsonwebtoken");
const { validObjectId } = require('../validations/validator1');
const UserModel = require("../models/userModel");

const authentication = function (req, res, next) {
  try {
    const Bearer = req.headers["authorization"]  // token from headers
    if (!Bearer) {
        return res.status(400).send({ status: false, message: "token must be present" })
    }
    else {
        const token = Bearer.split(" ")
        if (token[0] !== "Bearer") {
            return res.status(400).send({ status: false, message: "Select Bearer Token in headers" })
        }
        jwt.verify(token[1], "group1", function (err, decodedToken) {

            if (err) {
                if (err.message == "invalid token" || err.message == "invalid signature") {
                    return res.status(401).send({ status: false, message: "Token in not valid" })
                }
                if (err.message == "jwt expired") {
                    return res.status(401).send({ status: false, message: "Token has been expired" })
                }
                return res.status(401).send({ status: false, message: err.message })
            }
            else {
              req.user_Id = decodedToken.userId      
                next()
            }
        })
    }
}
catch (error) {
    return res.status(500).send({ status: false, message: error.message })
}
  };

  const authorization = async function (req, res, next) {
    const userId  = req.params.userId
    if (!validObjectId(userId)) {
      return res.status(400).send({status:false,message:"Invalid user ID"});
    }
   
    if (req.user_Id !== userId) {
      return res.status(403).send({status:false,message:"You are not authorized"});
    }
    next();
  };

  
  module.exports={authentication,authorization}