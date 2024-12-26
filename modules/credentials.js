require("dotenv").config();

const punchPassword = process.env.PUNCH_PASSWORD;
const punchApiKey = process.env.PUNCH_API_KEY;
const fmUser = process.env.FM_USER;
const fmPassword = process.env.FM_PASSWORD;
const fmServer = process.env.FM_SERVER;
const googleApiKey = process.env.GOOGLE_API_KEY;
const botUrl = process.env.BOT_URL;

module.exports = {
  punchPassword,
  fmUser,
  fmPassword,
  fmServer,
  googleApiKey,
  punchApiKey,
  botUrl,
};
