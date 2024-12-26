exports.locationDetails = (
  userId,
  userName,
  time,
  date,
  latitude,
  longitude,
  address,
  runNumber,
  status,
  notes
) => ({
  type: "AdaptiveCard",
  body: [
    {
      type: "TextBlock",
      size: "Large",
      weight: "Bolder",
      text: `You are: ${status}`,
    },
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
      text: `Location: ${address}`,
    },
    {
      type: "TextBlock",
      size: "Small",
      wrap: "true",
      text: `Notes: ${notes}`,
    },
  ],
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.4",
});
