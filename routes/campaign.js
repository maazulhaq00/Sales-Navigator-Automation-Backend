const express = require("express");
const UserCampaign = require("../models/userCampaign");
const app = express();
const auth = require("../middleware/auth");
const user = require("../models/users");

app.post("/campaign", async (req, res) => {
  const userCampaign = new UserCampaign(req.body);
  try {
    await userCampaign.save();
    res.status(201).send(userCampaign);
  } catch (e) {
    res.status(400).send(e);
  }
});
//get all usersCampaign
app.get("/campaign", async (req, res) => {
  user
    .find({})
    .populate("userId")
    .exec(function (err, usersCampaign) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: "Users List", data: usersCampaign });
    });
});
//find userCampaign by their id
app.get("/campaign/:id", async (req, res) => {
  const campaignId = req.params.id;
  user
    .find({ _id: campaignId })
    .populate("userId") // populate assignedTo
    .exec(function (err, users) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: "Users List", data: users });
    });
});

app.patch("/campaign/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "campaignTitle",
    "typingDelay",
    "delayPageNavigate",
    "noOfProfileVisitsPerHour",
    "noOfProfileVisitsPerDay",
    "visitsBeforeDelay",
    "visitDelay",
    "limitSnoozeDays",
    "workingDaysArr",
    "workHrsPerDay",
    "userId",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const user = await UserCampaign.findOne(
      { _id: req.params.id, userId: req.user._id },
      {}
    );

    if (!user) {
      return res.status(404).send();
    }
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.delete("/campaign/:id", auth, async (req, res) => {
  try {
    const user = await UserCampaign.findByIdAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = app;
