const mongoose  = require("mongoose");
const objectId = mongoose.Types.ObjectId



const validMail = (email) => /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
const validNumber = (phone) => (/^[6-9]{1}?[0-9]{9}$/).test(phone);
const validPinCode = (pincode) => /^[1-9]{1}?[0-9]{5}$/.test(pincode)
const validStreet = (street) => /^[a-zA-Z0-9- .]{3,90}$/.test(street);
const validCity = (value) => /^[a-zA-Z ]{3,20}$/.test(value);
const validFname = (lname) => /^[a-zA-Z ]{3,20}$/.test(lname);
const validLname = (fname) => /^[a-zA-Z ]{3,20}$/.test(fname);
const validPassword = (password) => /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password)
const validObjectId = (objectId) => {return mongoose.Types.ObjectId.isValid(objectId)}
let  validFile = (value) =>  /\.(jpe?g|png)$/i.test(value)

      

module.exports = {validMail, validNumber, validCity, validPinCode, validStreet, validFname, validLname,validPassword,
validObjectId,validFile}