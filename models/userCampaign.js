const mongoose = require("mongoose");
const validator = require("validator");
const Leads = require("./lead");
const { Schema, Types } = mongoose;

const schema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("campaign title cannot be empty");
      }
    },
  },
  description: {
    type: String,
    trim: true,
  },
  connectionRequest: {
    type: String,
    trim: true,
  },
  followups: [
    {
      days: {
        type: Number,
        trim: true,
        required: true,
        validate(value) {
          if (value > 365) {
            throw new Error("Follow-up days should not be more than 365 days");
          }
        },
      },
      hours: {
        type: Number,
        trim: true,
        required: true,
        validate(value) {
          if (value > 24) {
            throw new Error("Follow-up hours should not be more than 24 hours");
          }
        },
      },
      followUpMessage: {
        type: String,
        trim: true,
        required: true,
      },
    },
  ],
  typingDelay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 60000) {
        throw new Error("Typing delay should not exceed 60000ms / 60s");
      }
    },
  },
  pageNavigationDelay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 600000) {
        throw new Error("Typing delay should not exceed 600000ms / 10m");
      }
    },
  },
  noOfVisitsPerHr: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 100) {
        throw new Error(
          "No of profile visits per hour should not exceed 100 visits"
        );
      }
    },
  },
  noOfVisitsPerDay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 1300) {
        throw new Error(
          "No of profile visits per day should not exceed 1300 visits"
        );
      }
    },
  },
  profileVisitsBeforeDelay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 1000) {
        throw new Error(
          "No of profile visits before delay should not exceed 1000 visits"
        );
      }
    },
  },
  profileVisitDelay: {
    type: Number,
    required: true,
    trim: true,
    validate(value) {
      if (value > 3600000) {
        throw new Error(
          "The delay after certain no of profile visits should not exceed 3600000ms / 1h"
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
          "Snooze days should not exceed 365 days"
        );
      }
    },
  },
  workingDaysArr: [
    {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (validator.isEmpty(value)) {
          throw new Error("working days cannot be empty");
        }
      },
    }
  ],
  workHrsPerDay: [
    {
      type: String,
      required: true,
      trim: true
    }
  ],
});

const Campaign = mongoose.model("UserCampaign", schema);

module.exports = Campaign;
