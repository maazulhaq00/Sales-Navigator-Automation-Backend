const express = require("express");
const Leads = require("../models/lead");
const app = express();
const auth = require("../middleware/auth");
const userCampaign = require("../models/userCampaign");

app.post("/leads", async (req, res) => {
  const leads = new Leads(req.body);
  try {
    await leads.save();
    res.status(201).send(leads);
  } catch (e) {
    res.status(400).send(e);
  }
});
app.get("/leads", async (req, res) => {
  userCampaign
    .find({})
    .populate("userCampaignId")
    .exec(function (err, leads) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: "User Campaing List", data: leads });
    });
});
//find user by their id
app.get("/leads/:id", async (req, res) => {
  const userCampaignId = req.params.id;
  userCampaign
    .find({ _id: userCampaignId })
    .populate("userCampaignId")
    .exec(function (err, leads) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: "User Campaing List", data: leads });
    });
});
app.patch("/leads/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "profileUrl",
    "firstName",
    "middleName",
    "lastName",
    "title",
    "companyName",
    "location",
    "industry",
    "chatUrl",
    "campaignId",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const leads = await Leads.findOne({
      _id: req.params.id,
      campaignId: req.user._id,
    });

    if (!leads) {
      return res.status(404).send();
    }
    updates.forEach((update) => (leads[update] = req.body[update]));
    await leads.save();
    res.send(leads);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = app;
