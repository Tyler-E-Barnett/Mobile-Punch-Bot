require("dotenv").config();
// require("dotenv").config({ path: "env/.env.dev", override: true });
const mongoose = require("mongoose");
const restify = require("restify");
const cors = require("cors");
const { Punch, Run } = require("./schemas/schemas");
const { FilemakerPunch } = require("./controllers/FilemakerPunch");
const https = require("https");
const axios = require("axios");
const certifi = require("certifi");

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConfigurationBotFrameworkAuthentication,
} = require("botbuilder");
const { TeamsBot } = require("./teamsBot");
const config = require("./config");

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: config.botId,
  MicrosoftAppPassword: config.botPassword,
  MicrosoftAppType: "MultiTenant",
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  {},
  credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights. See https://aka.ms/bottelemetry for telemetry
  //       configuration instructions.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a message to the user
  await context.sendActivity(
    `The bot encountered an unhandled error:\n ${error.message}`
  );
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

// Create the bot that will handle incoming messages.
const bot = new TeamsBot();

//mondodb connect
const mongoURI = process.env.PSEMONGOURL;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Create HTTP server.
const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

server.use(cors());

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await bot.run(context);
  });
});

server.get("/runs/:userId", async (req, res) => {
  const userId = req.params["userId"];

  const currentDate = new Date();

  console.log(userId);

  try {
    console.log("getting runs...");
    const runs = await Run.find({ "crew.userId": userId });

    let runNums = runs.map((item, index) => {
      return {
        title: `${item.description} - ${new Date(
          item.runDate
        ).toLocaleDateString("en-US")} - ${item.vehicle}`,
        value: item.runNumber,
      };
    });

    // When no runs are found, give the option Unscheduled
    if (runNums.length === 0) {
      runNums = [{ title: "Unscheduled", value: 0 }];
    }

    console.log(runNums);
    res.send(runNums);
  } catch (error) {
    console.error(error);
    res.send(500, error);
  }
});

server.post("/punch/:apikey", async (req, res) => {
  if (req.params["apikey"] === "Power1718!") {
    const {
      userId,
      name,
      timeStamp,
      time,
      date,
      runNumber,
      notes,
      location: { latitude },
      location: { longitude },
      location: { address },
    } = req.body;

    let found;

    try {
      found = await Punch.findOne({
        userId: userId,
        runNumber: runNumber,
        // timeIn: { $re: "" },
        timeOut: "",
      });
    } catch (error) {
      res.send(500, error);
    }
    console.log("found:");
    console.log(found);

    if (found == null) {
      console.log("making new entry");
      const punchStatus = "Punched In";
      const data = {
        userId: userId,
        name: name,
        timeStampIn: timeStamp,
        dateIn: date,
        timeIn: time,
        timeStampOut: "",
        dateOut: "",
        timeOut: "",
        runNumber: runNumber,
        notesIn: notes,
        locationIn: {
          latitude: latitude,
          longitude: longitude,
          address: address,
        },
      };
      const punchEntry = new Punch(data);

      try {
        const newPunch = await punchEntry.save();
        res.send(200, punchStatus);
      } catch (error) {
        res.send(500, error);
      }
    } else {
      console.log("entry found and updating...");
      const punchStatus = "Punched Out";
      const update = {
        timeStampOut: timeStamp,
        dateOut: date,
        timeOut: time,
        notesOut: notes,
        locationOut: {
          latitude: latitude,
          longitude: longitude,
          address: address,
        },
      };
      try {
        const punchOut = await found.updateOne(update, {
          new: true,
        });
        res.send(200, punchStatus);
      } catch (error) {
        res.send(500, error);
      }
    }
  } else {
    console.log("incorrect api key");
    res.send(400, "incorrect api key");
  }
});

server.post("/filemaker/punch/:password", FilemakerPunch);

server.get("/test", (req, res, next) => {
  const result = process.env.TEST;
  res.send(200, `this is the result`);
});

// Serve static pages from the 'pages' folder.
server.get(
  "/*",
  restify.plugins.serveStatic({
    directory: "./pages",
  })
);

// Gracefully shutdown HTTP server
[
  "exit",
  "uncaughtException",
  "SIGINT",
  "SIGTERM",
  "SIGUSR1",
  "SIGUSR2",
].forEach((event) => {
  process.on(event, () => {
    console.log(event);

    server.close();
    mongoose.disconnect();
  });
});

server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\nBot started, ${server.name} listening to ${server.url}`);
});
