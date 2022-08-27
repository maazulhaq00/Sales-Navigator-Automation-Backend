const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require("../models/users");
const UserCampaign = require("../models/userCampaign");
const Leads = require("../models/lead");

const cron = require("node-cron");

const followUpCronJob = (userId, campaignId) => {
  // email, password, profiles, followupMsg, typingdelay, navigation delay

  const user = await User.findOne({_id: userId})
  const campaign = await UserCampaign.findOne({_id: campaignId})
  const leads = await Leads.find({userId: userId})

  email = user?.linkedInEmail
  password = user?.linkedInPassword

  // iterate over leads to make [{url:"...."}]
  let profiles = leads.map((lead)=>({url: lead.profileUrl}))

  // iterate campaign.followups array and set schedular for each follow up
  for(let i = 0; i< campaign.followups.length; i++){
   
    let days = campaign.followups[i].days;
    let hours = campaign.followups[i].hours;
    let followupMsg = campaign.followups[i].followUpMessage;
    
    let milliseconds = days*24*60*60*1000 + hours*60*60*1000
    setTimeout(()=>{
      fetch('http://localhost:3006/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          followupMsg: followupMsg,
          profiles: profiles,
          pageNavigationDelay: campaign.pageNavigationDelay,
          typingDelay: campaign.typingDelay,
        }),
      })
        .then((response) => {
          console.log(response.json());
        })
        .catch((err) => {
          console.log(err);
        });
    }, milliseconds)
  }  
};

// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });
