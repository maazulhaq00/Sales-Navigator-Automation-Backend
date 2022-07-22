const express = require("express");
const User = require("../models/users");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const app = express();

const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // use SSL
    secureConnection: false,
    auth: {
      user: "salesnavigatorauto@gmail.com",
      pass: "vmbgtkgmnwzwpzlm",
    },
  });

  await transporter.sendMail({
    from: '"Sales Navigator Auto 🤖" <salesnavigatorauto@gmail.com>',
    to,
    subject,
    html,
  });
}

app.post("/user/signup", async (req, res) => {
  // checks if password and confirm password matches
  if (req.body.password != req.body.confirmPassword) {
    res.status(400).json({ message: "Password does not match" });
  }
  // checks if user already exits
  const user = await User.findOne({ email: req.body.email });
  
  console.log(user)

  if (user) {
    res.status(400).json({ message: "Email already signed-up" });
  } else {
    // create user with isVerified false
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      linkedInEmail: req.body.linkedInEmail,
      linkedInPassword: req.body.linkedInPassword,
      isVerified: false,
    });

    console.log(user);

    const token = jwt.sign({ _id: user._id.toString() }, "salesnavsecret");
    user.tokens = user.tokens.concat({ token });

    console.log(user);

    // send verification mail
    sendEmail({
      to: user.email,
      subject: "SALES NAVIGATOR: VERIFY YOUR EMAIL",
      html: `
        <html>
          <body>
            <p>Hi ${user.firstName},</p>
            <p>Welcome to Sales Navigator Automation!</p>
            <p>
              To verify your account click
              <a href="https://www.frontend.com/verify-account?token=${
                user.tokens[user.tokens.length - 1].token
              }">HERE</a>
  
            </p>
          </body>
        
        </html>   
      `,
    })
      .then(async () => {
        console.log("smtp success");
        try {
          await user.save();
          res
            .status(201)
            .json({ message: "Please verify your email account", user });
        } catch (err) {
          res.status(400).json({ message: err.message });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error occure while sending verification email",
          errorMessage: err.message,
        });
      });
  }
});

app.post("/user/verify-account", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    req.user.isVerified = true;
    await req.user.save();
    res.json({ message: "Account verified!" });
  } catch (err) {
    res.status(500).json({
      message: "Error occure while verifing account",
      errorMessage: err.message,
    });
  }
});

app.post("/user/resend-verification-mail", async (req, res) => {
  
  const user = await User.findOne({ email: req.body.email });
  console.log(user)

  if (!user) {
    res.status(400).json({ message: "Please sign-in first" });
  } else if (user.isVerified == true) {
    res.status(400).json({ message: "Your account is already verified" });
  } else {
    const token = jwt.sign({ _id: user._id.toString() }, "salesnavsecret");
    user.tokens = user.tokens.concat({ token });

    console.log(user);

    // send verification mail
    sendEmail({
      to: user.email,
      subject: "SALES NAVIGATOR: VERIFY YOUR EMAIL",
      html: `
          <html>
            <body>
              <p>Hi ${user.firstName},</p>
              <p>Welcome to Sales Navigator Automation!</p>
              <p>
                To verify your account click
                <a href="https://www.frontend.com/verify-account?token=${
                  user.tokens[user.tokens.length - 1].token
                }">HERE</a>
              </p>
            </body>
          </html>   
        `,
    })
      .then(async () => {
        console.log("smtp success");
        try {
          await user.save();
          res.status(201).json({
            message:
              "Verification email sent, please verify your email account",
            user,
          });
        } catch (err) {
          res.status(400).json({ message: err.message });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error occure while sending verification email",
          errorMessage: err.message,
        });
      });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.json({ message: "Successfully Login", user, token });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Login Failed", errorMessage: err.message });
  }
});

app.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.json({ message: "Successfully Logout" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Logout Failed", errorMessage: err.message });
  }
});

app.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.json({ message: "Successfully Logout All" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Logout All Failed", errorMessage: err.message });
  }
});

app.patch("/user/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "firstName",
    "lastName",
    "email",
    "password",
    "linkedInEmail",
    "linkedInPassword",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});
module.exports = app;
