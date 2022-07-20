const mongoose = require("mongoose");
const validator = require("validator");
const { Schema, Types } = mongoose;

const schema = new mongoose.Schema({
  profileUrl: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("Profile Url cannot be empty");
      }
    },
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("First name cannot be empty");
      }
    },
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  chatUrl: {
    type: String,
    trim: true,
  },
});

const Leads = mongoose.model("Leads", schema);
module.exports = Leads;
