const express = require("express");
const mongoose = require("./db/mongoose");

const UserCampaign = require("./models/userCampaign");
const Leads = require("./models/lead");

const user = require("./routes/user");
const campaigns = require("./routes/campaign");
const lead = require("./routes/leads");
const dotenv = require("dotenv")
dotenv.config()

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());

app.use(user);
app.use(campaigns);
app.use(lead);

app.listen(PORT, () => {
  console.log("Server is up and running on port " + PORT);
});
