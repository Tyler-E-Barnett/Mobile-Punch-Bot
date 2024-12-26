function missedPunch(runs) {
  return {
    type: "AdaptiveCard",
    body: [
      {
        type: "TextBlock",
        size: "Medium",
        weight: "Bolder",
        text: "Missed Punch",
      },
      {
        type: "TextBlock",
        text: "Fill out the info below.",
        wrap: true,
      },
      {
        type: "Input.ChoiceSet",
        value: "run",
        choices: runs,
        placeholder: "Run",
        id: "runNumber",
        isRequired: true,
      },
      {
        type: "Input.Text",
        value: "reason",
        placeholder: "Reason for Miss",
        id: "reason",
        isRequired: true,
      },
      {
        type: "Input.Date",
        value: "missedDate",
        id: "missedDate",
        isRequired: true,
      },
      {
        type: "Input.Time",
        value: "missedTime",
        id: "missedTime",
        isRequired: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit",
        data: {
          msteams: {
            type: "task/fetch",
            displayText: "Select",
          },
          id: "missedPunch",
        },
      },
    ],
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
  };
}

module.exports.missedPunch = missedPunch;
