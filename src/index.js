const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const cors = require('cors')
const router = require("./routers/router")
mongoose.set('strictQuery', true)

const app = express()
app.use(express.json())
app.use(multer().any())
app.use(cors())

mongoose.connect("mongodb+srv://sanhil143:raisahab12345@sanhildb.kk3knyj.mongodb.net/group1Database")
.then(() => console.log("mongoDB is connected"))
.catch((error) => console.error(error))


app.use('/', router)

app.listen(3000, () => {
      console.log("Express app running on port " + 3000)
})