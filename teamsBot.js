const {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  MessageFactory,
} = require("botbuilder");
const {
  TaskModuleResponseFactory,
} = require("./models/TaskModuleResponseFactory");
const rawWelcomeCard = require("./adaptiveCards/welcome.json");
const rawLearnCard = require("./adaptiveCards/learn.json");
const rawPunchInCard = require("./adaptiveCards/punchin.json");
const rawSummaryCard = require("./adaptiveCards/summary.json");
const cardTools = require("@microsoft/adaptivecards-tools");
const { microsoftTeams, app, context } = require("@microsoft/teams-js");
const axios = require("axios");
const { getRuns } = require("./modules/getRuns");
const { punchCard } = require("./adaptiveCards/punch");
const { missedPunch } = require("./adaptiveCards/missedPunch");
const { locationDetails } = require("./adaptiveCards/locationDetails");
const { googleAPIKey, punchApiKey, botUrl } = require("./modules/credentials");
// runs function causing cloud app not to work.  works when getruns parameter isnt bot domain
// console.log(botUrl);

// const runs = getRuns(botUrl);
let runNum;
let notes;

// console.log(googleAPIKey);

class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.baseUrl = botUrl;
    // console.log(process.env.BOT_ENDPOINT);

    // microsoftTeams.getContext(context => {
    //   const userId = context.userObjectId;
    //   console.log(userId);
    // });

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");
      let txt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(
        context.activity
      );
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }
      const userId = context.activity.from.aadObjectId;

      // Get the user's display name
      // const userInfo = await TeamsInfo.getMember(context, userId);
      // const userName = userInfo.name;

      // Now you have the user's username (display name)
      // context.send(`Hello, ${userName}!`);
      console.log(context);

      // Trigger command by IM text
      switch (txt) {
        case "punch": {
          // removed await
          const runs = getRuns(botUrl, userId);
          console.log(await runs);
          let punchAC = punchCard(await runs);
          const card =
            cardTools.AdaptiveCards.declareWithoutData(punchAC).render();
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
        case "missed punch": {
          let cardRun = await runs;
          let punchAC = missedPunch(cardRun);
          const card =
            cardTools.AdaptiveCards.declareWithoutData(punchAC).render();
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
        case "summary": {
          const card =
            cardTools.AdaptiveCards.declareWithoutData(rawSummaryCard).render();
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
      }

      // console.log(context);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    // unnecessary?
    // Listen to MembersAdded event, view https://docs.microsoft.com/en-us/microsoftteams/platform/resources/bot-v3/bots-notifications for more events
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          const card =
            cardTools.AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
      }
      await next();
    });
  }

  // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
  // method handles that event.
  async onAdaptiveCardInvoke(context, invokeValue) {
    // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
    if (invokeValue.action.verb === "userlike") {
      this.likeCountObj.likeCount++;
      const card = cardTools.AdaptiveCards.declare(rawLearnCard).render(
        this.likeCountObj
      );
      await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [CardFactory.adaptiveCard(card)],
      });
      return { statusCode: 200 };
    }
  }

  handleTeamsTaskModuleFetch(context, taskModuleRequest) {
    const cardTaskFetchId = taskModuleRequest.data.id;
    let taskInfo = {};

    // console.log(taskModuleRequest.data.runNumber);
    runNum = taskModuleRequest.data.runNumber;
    notes = taskModuleRequest.data.notes;
    // console.log(runNum);
    const userId = context.activity.from.aadObjectId;

    switch (cardTaskFetchId) {
      case "punch": {
        console.log("checking in...");
        taskInfo.url = taskInfo.fallbackUrl = botUrl + "/CheckIn.html";
        // console.log(taskInfo.url);
        taskInfo.height = 350;
        taskInfo.width = 350;
        taskInfo.title = `Check in details`;
        taskInfo.run = runNum;
        taskInfo.notes = notes;
        break;
      }
      case "missedPunch": {
        console.log("missed punch");
        taskInfo.url = taskInfo.fallbackUrl = this.baseUrl + "/CheckIn.html";
        // console.log(taskInfo.url);
        taskInfo.height = 350;
        taskInfo.width = 350;
        taskInfo.title = "Missed Punch";
        taskInfo.run = runNum;
        taskInfo.reason = taskModuleRequest.data.reason;
        taskInfo.missedTime = taskModuleRequest.data.missedTime;
        taskInfo.missedDate = taskModuleRequest.data.missedDate;
        // await context.sendActivity({ attachments: [locationCard] });
        break;
      }
      case "summary": {
        taskInfo.url = taskInfo.fallbackUrl = this.baseUrl + "/Form.html";
        taskInfo.title = "Custom Form";
        taskInfo.height = 510;
        taskInfo.width = 430;
        // dialogResponse = dialogResponse => {
        //   console.log(`Submit handler - err: ${dialogResponse.err}`);
        //   alert(
        //     "Result = " +
        //       JSON.stringify(dialogResponse.result) +
        //       "\nError = " +
        //       JSON.stringify(dialogResponse.err)
        //   );
        // };
        break;
      }
    }
    // microsoftTeams.dialog.open(taskInfo, dialogResponse);

    // if (cardTaskFetchId == "punch") {
    //   console.log("checking in...");
    //   taskInfo.url = taskInfo.fallbackUrl = this.baseUrl + "/CheckIn.html";
    //   console.log(taskInfo.url);
    //   taskInfo.height = 350;
    //   taskInfo.width = 350;
    //   taskInfo.title = "Check in details";
    // }

    return TaskModuleResponseFactory.toTaskModuleResponse(taskInfo);
  }
  async handleTeamsTaskModuleSubmit(context, taskModuleRequest) {
    let locationCard;

    console.log(taskModuleRequest.data.reason);

    if (taskModuleRequest.data.reason != undefined) {
      let newCheckinDetails = {
        userId: context.activity.from.aadObjectId,
        userName: context.activity.from.name,
        timeStamp: context.activity.localTimestamp.toString(),
        time: taskModuleRequest.data.missedTime,
        date: taskModuleRequest.data.missedDate,
        reason: taskModuleRequest.data.reason,
        runNumber: runNum,
        notes: notes,
      };

      locationCard = CardFactory.adaptiveCard(
        missedDetails(
          newCheckinDetails.userId,
          newCheckinDetails.userName,
          newCheckinDetails.time,
          newCheckinDetails.date,
          newCheckinDetails.reason,
          newCheckinDetails.runNumber
        )
      );
    } else {
      // seperates timestamp into date and time
      const gmtDateString = new Date(context.activity.localTimestamp);
      const gmtDate = new Date(gmtDateString);
      const localDate = new Date(
        gmtDate.setDate(gmtDate.getDate())
      ).toLocaleDateString("en-US", {
        timeZone: "America/New_York",
      });
      const localTime = new Date(
        gmtDate.setDate(gmtDate.getDate())
      ).toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
      });
      const formattedTime = localTime.replace(/\s/g, "");

      // console.log(gmtDateString);
      // console.log(gmtDate);
      // console.log(localDate);
      // console.log(localTime);

      // removed .tostring() at the end of timestamp

      let newCheckinDetails = {
        userId: context.activity.from.aadObjectId,
        userName: context.activity.from.name,
        latitude: taskModuleRequest.data.latitude,
        longitude: taskModuleRequest.data.longitude,
        timeStamp: new Date(context.activity.localTimestamp).toISOString(),
        time: formattedTime,
        date: localDate,
        runNumber: runNum,
        notes: notes,
      };

      let address = await axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newCheckinDetails.latitude},${newCheckinDetails.longitude}&key=${googleAPIKey}`
        )
        .then((response) => response.data.results[1].formatted_address);

      // console.log(address);

      //NEED TO ADD ADDRESS TO newCheckinDetails object
      newCheckinDetails.address = address;

      // Put Axios stuff here so it can go into card
      const url = this.baseUrl + `/punch/${punchApiKey}`;

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const data = {
        userId: newCheckinDetails.userId,
        name: newCheckinDetails.userName,
        timeStamp: newCheckinDetails.timeStamp,
        time: newCheckinDetails.time,
        date: newCheckinDetails.date,
        runNumber: newCheckinDetails.runNumber,
        notes: newCheckinDetails.notes,
        location: {
          latitude: newCheckinDetails.latitude,
          longitude: newCheckinDetails.longitude,
          address: newCheckinDetails.address,
        },
      };
      console.log("data");
      console.log(data);
      console.log("axios part...");

      async function status() {
        try {
          const res = await axios.post(url, data);
          console.log("this is the response:");
          const status = res.data;
          console.log(status);
          return status;
        } catch (err) {
          console.log("axios error");
          console.log(err);
        }
      }

      const punchStatus = await status();
      console.log(punchStatus);

      if (punchStatus === "Punched In") {
        newCheckinDetails.status = "Punched In";
      } else {
        newCheckinDetails.status = "Punched Out";
      }

      console.log("axios end");

      // change status to punched in or out based on axios response

      // await this.saveUserDetails(context, newCheckinDetails);
      locationCard = CardFactory.adaptiveCard(
        locationDetails(
          newCheckinDetails.userId,
          newCheckinDetails.userName,
          newCheckinDetails.time,
          newCheckinDetails.date,
          newCheckinDetails.latitude,
          newCheckinDetails.longitude,
          newCheckinDetails.address,
          newCheckinDetails.runNumber,
          newCheckinDetails.status,
          newCheckinDetails.notes
        )
      );
    }
    await context.sendActivity({ attachments: [locationCard] });

    return null;

    // await context.sendActivity(
    //   MessageFactory.text(
    //     "handleTeamsTaskModuleSubmit: " + JSON.stringify(newCheckinDetails)
    //   )
    // );

    // return {
    //   // TaskModuleMessageResponse
    //   task: {
    //     type: "message",
    //     value: "Thanks!",
    //   },
    // };
  }
  async saveUserDetails(context, newCheckinDetails) {
    // var currentData = conversationDataReferences["userDetails"];

    // console.log(newCheckinDetails);
    console.log("axios start");
    console.log(this.baseUrl);

    const url = this.baseUrl + `/punch/${punchApiKey}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const data = {
      userId: newCheckinDetails.userId,
      name: newCheckinDetails.userName,
      timeStamp: newCheckinDetails.time,
      runNumber: newCheckinDetails.runNumber,
      notes: newCheckinDetails.notes,
      location: {
        latitude: newCheckinDetails.latitude,
        longitude: newCheckinDetails.longitude,
        address: newCheckinDetails.address,
      },
    };

    await axios
      .post(url, data)
      .then(function (response) {
        console.log(response.data);
        console.log("Axios Post Successful");
      })
      .catch(function (error) {
        console.log("error on front end");
        console.log(error);
      });

    console.log("axios end");
  }
}

module.exports.TeamsBot = TeamsBot;
