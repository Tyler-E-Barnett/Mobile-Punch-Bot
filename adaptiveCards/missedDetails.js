exports.locationDetails = (userName, time, date, runNumber, reason) => ({
  type: "AdaptiveCard",
  body: [
    {
      type: "TextBlock",
      size: "Medium",
      weight: "Bolder",
      text: `Name is: ${userName}`,
    },
    {
      type: "TextBlock",
      size: "Medium",
      weight: "Bolder",
      wrap: "true",
      text: `Check in date: ${date}`,
    },
    {
      type: "TextBlock",
      size: "Medium",
      weight: "Bolder",
      wrap: "true",
      text: `Check in time: ${time}`,
    },
    {
      type: "TextBlock",
      size: "Medium",
      weight: "Bolder",
      wrap: "true",
      text: `Run Number: ${runNumber}`,
    },
    {
      type: "TextBlock",
      size: "Medium",
      weight: "Bolder",
      wrap: "true",
      // replaced latitude and longitude with address.  need to get address to work
      text: `reason: ${reason}`,
    },
  ],
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.4",
});
