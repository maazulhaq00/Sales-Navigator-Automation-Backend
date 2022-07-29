const dotenv = require("dotenv")
dotenv.config()

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/SalesNavAuto');