const express = require("express");
const Leads = require("../models/lead");
const app = express();
const auth = require("../middleware/auth");
const user = require("../models/users");

app.post("/leads", auth, async (req, res) => {
  const lead = new Leads({
    userId: req.user._id,
    ...req.body,
  });
  try {
    await lead.save();
    res.status(201).send({ message: "Lead added!", lead });
  } catch (e) {
    res
      .status(400)
      .send({ message: "Failed to add the lead", errorMessage: e.message });
  }
});
app.get("/leads", auth, async (req, res) => {
  try {
    const leads = await Leads.find({ userId: req.user._id });
    res.send({
      message: "Successfully fetch all the leads of the user",
      leads,
    });
  } catch (e) {
    res.status(500).send({
      message: "Error in finding all the leads data",
      errorMessage: e.message,
    });
  }
});
app.get("/leads/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const lead = await Leads.find({ _id: _id, userId: req.user._id });

    if (!lead) {
      return res.status(404).send({ message: "The lead id is not correct" });
    }
    res.send({ message: "Successfully fetched the specified lead", lead });
  } catch (e) {
    res.status(500).send({
      message: "Failed to fetch specified lead",
      errorMessage: e.message,
    });
  }
});
app.patch("/leads/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "requestStatus",
    "profileUrl",
    "firstName",
    "middleName",
    "lastName",
    "title",
    "companyName",
    "location",
    "industry",
    "chatUrl",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ message: "Invalid updates!" });
  }
  try {
    const lead = await Leads.findOne(
      { _id: req.params.id, userId: req.user._id },
      {}
    );

    if (!lead) {
      return res.status(404).send({ message: "Please provide correct id" });
    }
    updates.forEach((update) => (lead[update] = req.body[update]));
    await lead.save();
    res.send({ message: "Successfully updated the specified lead", lead });
  } catch (e) {
    res.status(400).send({
      message: "Error occure while updating lead",
      errorMessage: e.message,
    });
  }
});

app.delete("/leads/:id", auth, async (req, res) => {
  try {
    await Leads.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    res.json({ message: "Successfully Deleted" });
  } catch (e) {
    res.status(500).send({
      message: "Error occur while deleting the lead",
      errorMessage: e.message,
    });
  }
});

app.delete("/leads", auth, async (req, res) => {
  try {
    await Leads.deleteMany({ userId: req.user._id });

    res.json({ message: "Successfully Deleted all the leads" });
  } catch (e) {
    res.status(500).send({
      message: "Error occur while deleting all leads",
      errorMessage: e.message,
    });
  }
});

module.exports = app;
