const jwt = require("jsonwebtoken");
const User = require("../models/users");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "salesnavsecret");
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("Faild to authenticate");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ message: "Faild to authenticate", errMessage: e.message });
  }
};

module.exports = auth;
