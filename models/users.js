const mongoose = require("mongoose");
const validator = require("validator");
const { Schema, Types } = mongoose;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const schema = new mongoose.Schema({
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
  lastName: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("Last name cannot be empty");
      }
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      } else if (validator.isEmpty(value)) {
        throw new Error("Email cannot be empty");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("userPassword cannot be empty");
      }
    },
  },
  linkedInEmail: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("LinkedIn email is invalid");
      } else if (validator.isEmpty(value)) {
        throw new Error("Email cannot be empty");
      }
    },
  },
  linkedInPassword: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error("LinkedIn password cannot be empty");
      }
    },
  },
  isVerified:{
    type: Boolean,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  userId: {
    type: Types.ObjectId,
    ref: "Users",
  },
});

schema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

schema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "salesnavsecret");

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

schema.statics.findByCredentials = async (name, password) => {
  const user = await User.findOne({ name });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

schema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("Users", schema);

module.exports = User;
