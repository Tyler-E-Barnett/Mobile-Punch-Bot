const { microsoftTeams, app, context } = require("@microsoft/teams-js");

app.initialize();

app.getContext().then(context => {
  console.log(context);
});
