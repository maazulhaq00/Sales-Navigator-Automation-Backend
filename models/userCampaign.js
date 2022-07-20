const mongoose = require("mongoose");
const validator = require("validator");
const Leads = require("./lead");
const { Schema, Types } = mongoose;

const schema = new mongoose.Schema({
  campaignTitle: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("campaign title cannot be");
      }
    },
  },
  typingDelay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 60000) {
        throw new Error("Typing delay is should be less than 60000ms / 60s");
      }
    },
  },
  delayPageNavigate: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 600000) {
        throw new Error("Typing delay is should be less than 600000ms / 10m");
      }
    },
  },
  noOfProfileVisitsPerHour: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 100) {
        throw new Error(
          "No of profile visits per hour should be less than 100"
        );
      }
    },
  },

  noOfProfileVisitsPerDay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 1300) {
        throw new Error(
          "No of profile visits per hour should be less than 1300"
        );
      }
    },
  },

  visitsBeforeDelay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 1000) {
        throw new Error(
          "No of profile visits before delay should be less than 1000"
        );
      }
    },
  },
  visitDelay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 3600000) {
        throw new Error(
          "delay profile visits per hour should be less than 3600000ms / 1h"
        );
      }
    },
  },
  limitSnoozeDays: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 365) {
        throw new Error(
          "limit snooze days after reaching the limit is less than 365 days"
        );
      }
    },
  },
  workingDaysArr: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("working days cannot be empty");
      }
    },
  },
  workHrsPerDay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 24) {
        throw new Error("work hrs per day should be less than 24");
      }
    },
  },
  userCampaignId: {
    type: Types.ObjectId,
    ref: "UserCampaign",
  },
});

const Campaign = mongoose.model("UserCampaign", schema);

module.exports = Campaign;
