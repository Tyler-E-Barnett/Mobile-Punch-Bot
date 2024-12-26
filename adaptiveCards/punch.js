function punchCard(runs) {
  let runValue;
  let description;
  if (runs.length >= 2) {
    runValue = null;
    description = "Choose a run then hit Punch";
  } else {
    runValue = runs[0].value;
    description = "Hit Punch";
  }

  return {
    type: "AdaptiveCard",
    body: [
      {
        type: "TextBlock",
        size: "Medium",
        weight: "Bolder",
        text: "PunchBot",
      },
      {
        type: "TextBlock",
        text: description,
        wrap: true,
      },
      {
        type: "Input.ChoiceSet",
        value: runValue,
        choices: runs,
        placeholder: "Choose a Run",
        id: "runNumber",
        isRequired: true,
      },
      {
        type: "Input.Text",
        // value: "notes",
        id: "notes",
        placeholder: "Notes",
        maxLength: 500,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Punch",
        data: {
          msteams: {
            type: "task/fetch",
            displayText: "Select",
          },
          id: "punch",
        },
      },
    ],
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
  };
}

module.exports.punchCard = punchCard;
