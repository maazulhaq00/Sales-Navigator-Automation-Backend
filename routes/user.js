const express = require("express");
const User = require("../models/users");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const app = express();

const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true, // use SSL
    secureConnection: false,
    auth: {
        user: 'salesnavigatorauto@gmail.com',
        pass: 'vmbgtkgmnwzwpzlm'
    },
    
  });

  await transporter.sendMail({ 
    from : '"Sales Navigator Auto 🤖" <salesnavigatorauto@gmail.com>', 
    to, subject, html 
  });
}

app.post("/user", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/user/signup", async (req, res) => {
  
  // checks if password and confirm password matches 
  if(req.body.password != req.body.confirmPassword){
    res.status(400).json({message: "Password does not match"});
  }

  // checks if user already exits
  const user = await User.findOne({ email: req.body.email });

  if(user){
    res.status(400).json({message: "Email already signed-in"});
  }
  else{
    // create user with isVerified false
    const user = new User({
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
      password:req.body.password,
      linkedInEmail:req.body.linkedInEmail,
      linkedInPassword:req.body.linkedInPassword,
      isVerified: false
    });

    console.log(user)

    const token = jwt.sign({ _id: user._id.toString() }, "salesnavsecret");
    user.tokens = user.tokens.concat({ token });

    console.log(user)
    
    // send verification mail
    sendEmail({to: user.email, subject: "SALES NAVIGATOR: VERIFY YOUR EMAIL", html: `
      <html>
        <body>
          <p>To verify your account click on the button below</p>
          <button onclick="verify()">VERIFY</button>
        </body>
        <script>
        function verify() {
          fetch('http://localhost:3000/user/verify-account', {
            method: 'POST',
            headers: {Authentication: 'Bearer ${user.tokens[user.tokens.length - 1].token}'}
          })
          .then(resp => resp.json())
          .then(json => console.log(json))
          }
        </script>
      </html>   
    `})
      .then(async ()=>{
          console.log("smtp success")
          try {
            await user.save();
            res.status(201).json({message : "Please verify your account", user});
          } catch (err) {
            res.status(400).json({message : err.message});
          }

      })
      .catch((err)=>{
        res.status(500).send({message: "Error occure while sending verification email", errorMessage: err.message});
      })

  }
});


app.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.userName,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

app.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

app.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

app.patch("/user/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "firstName",
    "middleName",
    "lastName",
    "title",
    "userName",
    "userPassword",
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
