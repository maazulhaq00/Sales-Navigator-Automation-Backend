const express = require("express");
const UserCampaign = require("../models/userCampaign");
const app = express();
const auth = require("../middleware/auth");
const user = require("../models/users");

app.post("/campaign", auth, async (req, res) => {
  const userCampaign = new UserCampaign({
    userId: req.user._id,
    ...req.body,
  });
  try {
    await userCampaign.save();
    res.status(201).send({ message: "User campaign added!", userCampaign });
  } catch (e) {
    res
      .status(400)
      .send({ message: "Failed to add campaign", errorMessage: e.message });
  }
});
app.get("/campaign", auth, async (req, res) => {
  try {
    const usercampaign = await UserCampaign.find({
      $or: [{ userId: req.user._id }, { isAdmin: true }],
    });
    res.send({
      message: "Successfully fetch all of campaigns of the user",
      usercampaign,
    });
  } catch (e) {
    res
      .status(500)
      .send({
        message: "Error in finding all the campaign data",
        errorMessage: e.message,
      });
  }
});
app.get("/campaign/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const campaign = await UserCampaign.find({
      _id: _id,
      userId: req.user._id,
    });

    if (!campaign) {
      return res
        .status(404)
        .send({ message: "The campaign id is not correct" });
    }
    res.send({
      message: "Successfully fetched the specified campaign",
      campaign,
    });
  } catch (e) {
    res
      .status(500)
      .send({
        message: "Failed to fetch specified campaign",
        errorMessage: e.message,
      });
  }
});
app.patch("/campaign/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "title",
    "description",
    "connectionRequest",
    "followups",
    "typingDelay",
    "pageNavigationDelay",
    "noOfVisitsPerHr",
    "noOfVisitsPerDay",
    "profileVisitsBeforeDelay",
    "profileVisitDelay",
    "workingDaysArr",
    "workHrsPerDay",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ message: "Invalid updates!" });
  }
  try {
    const userCampaign = await UserCampaign.findOne(
      { _id: req.params.id, userId: req.user._id },
      {}
    );

    if (!userCampaign) {
      return res.status(404).send({ message: "Please provide correct id" });
    }
    updates.forEach((update) => (userCampaign[update] = req.body[update]));
    await userCampaign.save();
    res.send({
      message: "Successfully updated the specified campaign",
      userCampaign,
    });
  } catch (e) {
    res
      .status(400)
      .send({
        message: "Error occure while updating campaign",
        errorMessage: e.message,
      });
  }
});

app.delete("/campaign/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    await UserCampaign.findByIdAndDelete({
      _id,
    });

    res.json({ message: "Successfully Deleted" });
  } catch (e) {
    res
      .status(500)
      .send({
        message: "Error occur while deleting the campaign",
        errorMessage: e.message,
      });
  }
});

app.delete("/campaign", auth, async (req, res) => {
  try {
    await UserCampaign.deleteMany({ userId: req.user._id });

    res.json({ message: "Successfully Deleted all the campaigns" });
  } catch (e) {
    res
      .status(500)
      .send({
        message: "Error occur while deleting all campaigns",
        errorMessage: e.message,
      });
  }
});

module.exports = app;
