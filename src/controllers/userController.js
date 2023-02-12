const UserModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { uploadFile } = require('../aws/aws-connection')
const { validCity, validFname, validLname, validPinCode, validStreet,
      validMail, validNumber, validPassword, validObjectId, validFile } = require('../validations/validator1')

const register = async (req, res) => {
      try {
            let data = req.body;
            let profileImage = req.files;

            if (Object.keys(data).length === 0) {
                  return res.status(400).send({ status: false, message: "please enter data on body" })
            }
            //Destructuring body
            let { fname, lname, email, phone, password, address, ...rest } = data

            if (Object.keys(rest).length > 0) {
                  return res.status(400).send({ status: false, message: "another key not acceptable" })
            }

            //name's
            if (!fname) {
                  return res.status(400).send({ status: false, message: "please enter first name" })
            }
            if (!validFname(fname)) {
                  return res.status(400).send({ status: false, message: "please enter valid first name" })
            }
            if (!lname) {
                  return res.status(400).send({ status: false, message: "please enter last name" })
            }
            if (!validLname(lname)) {
                  return res.status(400).send({ status: false, message: "please enter valid last name" })
            }

            //email
            if (!email) {
                  return res.status(400).send({ status: false, message: "please enter email address" })
            }
            if (email.trim() == "" || !validMail(email.trim())) {
                  return res.status(400).send({ status: false, message: "please enter valid email address" })
            }
            let verifyEmail = await UserModel.findOne({ email: email })
            if (verifyEmail) {
                  return res.status(400).send({ status: false, message: "email is already exist! please enter another email address" })
            }

            //phone
            if (!phone) {
                  return res.status(400).send({ status: false, message: "please enter phone number" })
            }
            if (!validNumber(phone.trim())) {
                  return res.status(400).send({ status: false, message: "please enter valid phone number" })
            }
            let verifyPhone = await UserModel.findOne({ phone: phone })
            if (verifyPhone) {
                  return res.status(400).send({ status: false, message: "phone number is already exist! please enter another phone number" })
            }

            //password
            if (!password) {
                  return res.status(400).send({ status: false, message: "please enter password" })
            }
            if (!validPassword(password.trim())) {
                  return res.status(400).send({ status: false, message: "please enter valid password" })
            }
            data.password = await bcrypt.hash(data.password, 10)

            //address
            if (!address) {
                  return res.status(400).send({ status: false, message: "please enter address " })
            }
            try {
                  let add = JSON.parse(address)

                  if (!Array.isArray(add) == false) {
                        return res.status(400).send({ status: false, message: "inset address must be an object format" })
                  }
                  if (!add.shipping) {
                        return res.status(400).send({ status: false, message: "please enter shipping address!" })
                  }
                  if (!add.shipping.street) {
                        return res.status(400).send({ status: false, message: "please enter street name on shipping address!" })
                  }
                  if (!validStreet(add.shipping.street)) {
                        return res.status(400).send({ status: false, message: "please enter valid street name on shipping address!" })
                  }
                  if (!add.shipping.city) {
                        return res.status(400).send({ status: false, message: "please enter city name on shipping address!" })
                  }
                  if (!validCity(add.shipping.city)) {
                        return res.status(400).send({ status: false, message: "please enter valid city name on shipping address!" })
                  }
                  if (!add.shipping.pincode) {
                        return res.status(400).send({ status: false, message: "please enter pincode on shipping address!" })
                  }
                  if (!validPinCode((add.shipping.pincode).trim())) {
                        return res.status(400).send({ status: false, message: "please enter valid pincode on shipping address!" })
                  }
                  if (!add.billing) {
                        return res.status(400).send({ status: false, message: "please enter billing address!" })
                  }
                  if (!add.billing.street) {
                        return res.status(400).send({ status: false, message: "please enter street name on billing address!" })
                  }
                  if (!validStreet(add.billing.street)) {
                        return res.status(400).send({ status: false, message: "please enter valid street name on billing address!" })
                  }
                  if (!add.billing.city) {
                        return res.status(400).send({ status: false, message: "please enter city name on shipping address!" })
                  }
                  if (!validCity(add.billing.city)) {
                        return res.status(400).send({ status: false, message: "please enter valid city name on shipping address!" })
                  }
                  if (!add.billing.pincode) {
                        return res.status(400).send({ status: false, message: "please enter pincode on shipping address!" })
                  }
                  if (!validPinCode((add.billing.pincode).trim())) {
                        return res.status(400).send({ status: false, message: "please enter valid pincode on shipping address!" })
                  }
                  data.address = add
            }
            catch (error) {
                  if (error) {
                        return res.status(400).send({ status: false, message: "please enter address in valid object format" })
                  }
            }

            //Images
            if (profileImage && profileImage.length === 0) {
                  return res.status(400).send({ status: false, message: "please insert profile image!" })
            }

            if (profileImage.length > 0) {

                  if (profileImage.length > 1) return res.status(400).send({ status: false, message: 'please select only one profile image' })
                  if (!validFile(profileImage[0].originalname)) return res.status(400).send({ status: false, message: 'please select valid  image like jpeg , png ,jpg' })
                  let uploadedFileURL = await uploadFile(profileImage[0]);
                  data.profileImage = uploadedFileURL;
            }


            let savedData = await UserModel.create(data);
            return res.status(201).send({ status: true, message: "User created successfully", data: savedData })
      }
      catch (error) {
            return res.status(500).send({ status: false, message: error.message })
      }

}

const login = async (req, res) => {

      try {
            let data = req.body
            if (Object.keys(data).length === 0) {
                  return res.status(400).send({ status: true, message: "Please enter email or password" })
            }
            const { email, password } = data

            if (!email) {
                  return res.status(400).send({ status: false, message: "please enter email address" })
            }
            if (!password) {
                  return res.status(400).send({ status: false, message: "please enter password" })
            }
            let findData = await UserModel.findOne({ email: email })
            if (!findData) {
                  return res.status(400).send({ status: false, message: "Please enter correct email" })
            }
            let hash = findData.password
            let bcryptpwd = await bcrypt.compare(password.trim(), hash)
            if (!bcryptpwd) {
                  return res.status(400).send({ status: false, message: "Please enter correct password" })
            }
            let token = jwt.sign({ userId: findData._id }, "group1", { expiresIn: "1h" })
            let obj = { userId: findData._id, token }

            return res.status(200).send({ status: true, message: "User login successfull", data: obj })

      }
      catch (error) {
            return res.status(500).send({ status: false, message: error.message })
      }

}


const getUser = async (req, res) => {
      try {
            let userId = req.params.userId
            if (Object.keys(userId).length === 0) {
                  return res.status(400).send({ status: false, message: "Please enter userId on param" })
            }
            if (!validObjectId(userId)) {
                  return res.status(400).send({ status: false, message: "Please enter valid userId on param" })
            }
            let findData = await UserModel.findById({ _id: userId })
            if (!findData) {
                  return res.status(404).send({ status: false, message: "user not found" })
            }
            return res.status(200).send({ status: true, message: "User profile details", data: findData })
      }
      catch (error) {
            return res.status(500).send({ status: false, message: error, message })
      }
}

const updateUser = async (req, res) => {
      try {
            let id = req.params.userId
            let data = req.body
            let files = req.files

            let { fname, lname, email, profileImage, phone, password, address, ...rest } = data

            if (Object.keys(rest).length > 0) {
                  return res.status(400).send({ status: false, message: "another key not acceptable" })
            }
            if (Object.keys(data).length === 0) {
                  return res.status(400).send({ status: false, message: "please provide key and value" })
            }

            if (!validFname(fname)) {
                  return res.status(400).send({ status: false, message: "fname is invalid" })

            }
            if (!validLname(lname)) {
                  return res.status(400).send({ status: false, message: "lname is invalid" })
            }
            let user = await UserModel.findOne({ _id: id })

            if (address) {
                  try {
                        let add = JSON.parse(address)
                        let address1 = user.address
                        let { shipping, billing } = add


                        if (shipping) {
                              let { pincode, city, street } = shipping

                              if (street) {
                                    if (!validStreet(street)) return res.status(400).send({ status: false, message: "please enter valid street name on shipping address!" })
                                    address1.shipping.street = add.shipping.street
                              }

                              if (city) {
                                    if (!validCity(city)) return res.status(400).send({ status: false, message: "please enter valid city name on shipping address!" })
                                    address1.shipping.city = add.shipping.city
                              }

                              if (pincode) {
                                    if (!validPinCode(pincode)) return res.status(400).send({ status: false, message: "please enter valid pincode on shipping address!" })
                                    address1.shipping.pincode = add.shipping.pincode
                              }
                        }

                        // ===================billing

                        if (billing) {
                              let { pincode, city, street } = billing
                              if (street) {
                                    if (!validStreet(street)) return res.status(400).send({ status: false, message: "please enter valid street name on billing address!" })
                                    address1.billing.street = add.billing.street
                              }

                              if (city) {
                                    if (!validCity(city)) return res.status(400).send({ status: false, message: "please enter valid city name on billing address!" })
                                    address1.billing.city = add.billing.city
                              }

                              if (pincode) {
                                    if (!validPinCode(pincode)) return res.status(400).send({ status: false, message: "please enter valid pincode on billing address!" })
                                    address1.billing.pincode = add.billing.pincode
                              }
                        }

                        data.address = address1
                  }
            
            catch (error) {
                  if (error) {
                        return res.status(400).send({ status: false, message: "please enter address in valid object format" })
                  }
            }
      }
            if (password) {
            if (!validPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })
            data.password = await bcrypt.hash(password, 10);

      }


      if (email) {
            if (!validMail(email)) {
                  return res.status(400).send({ status: false, message: "email invalid" })
            }
            let emailCheck = await UserModel.findOne({ email: email })
            if (emailCheck) {
                  return res.status(400).send({ status: false, message: "email already exist" })
            }
      }

      if (phone) {
            if (!validNumber(phone)) {
                  return res.status(400).send({ status: false, message: " phone invalid use only 10 Number" })
            }
            let phoneCheck = await UserModel.findOne({ phone: phone })
            if (phoneCheck) {
                  return res.status(400).send({ status: false, message: "phone already exist" })
            }
      }

      if (files && files.length > 0) {
            let upload = await uploadFile(files[0])
            if (!upload) {
                  return res.status(400).send({ status: true, message: "please insert profile image" })
            }
            data.profileImage = upload
      }

      let updateData = await UserModel.findByIdAndUpdate({ _id: id }, data, { new: true })
      if (!updateData) {
            return res.status(404).send({ status: false, message: "not found user id " })
      }

      res.status(200).send({ status: true, message: "User profile updated", data: updateData })
}
      catch (error) {
      return res.status(500).send({ status: false, message: error.message })
}

}

module.exports = { login, register, getUser, updateUser }