require("dotenv").config();
const {
  punchPassword,
  fmUser,
  fmPassword,
  fmServer,
} = require("../modules/credentials");

const FilemakerPunch = async (req, res) => {
  if (req.params["password"] === punchPassword) {
    const {
      userId,
      name,
      timeStamp,
      time,
      date,
      runNumber,
      notesIn,
      notesOut,
      location: { latitude },
      location: { longitude },
      location: { address },
    } = req.body;

    let token;

    // log into Filemaker Database while specifying the external resource
    try {
      const loginConfig = {
        method: "post",
        url: `https://${fmServer}/fmi/data/vLatest/databases/API_External/sessions`,
        httpsAgent: new https.Agent({
          ca: certifi.where, // use the root certificates from certifi
        }),
        data: {
          fmDataSource: [
            {
              database: "Crew_Hours",
              username: fmUser,
              password: fmPassword,
            },
          ],
        },
        auth: {
          username: fmUser,
          password: fmPassword,
        },
      };

      const result = await axios(loginConfig);
      console.log(result.data);
      token = result.data.response.token;
      // res.send(200, result.data);
    } catch (error) {
      console.log(error);
      res.send(500, error);
    }

    // Search for an existing Record using UserID, RunNumber and emtpy timeOut

    let found;
    let recordId;

    try {
      const queryConfig = {
        method: "post",
        url: `https://${fmServer}/fmi/data/vLatest/databases/API_External/layouts/Timecard/_find`,
        httpsAgent: new https.Agent({
          ca: certifi.where, // use the root certificates from certifi
        }),
        data: {
          query: [
            { runNumber: `=${runNumber}`, timeOut: "=", userId: `=${userId}` },
          ],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const result = await axios(queryConfig);
      recordId = result.data.response.data[0].recordId;
      // found = result.data.messages.code
    } catch (error) {
      console.log("error on find");
      res.send(500, error);
    }

    console.log(recordId);

    // If not found, create a new punch record

    if (recordId === undefined || recordId === null) {
      console.log("making new entry");
      const punchStatus = "Punched In";

      try {
        const entryConfig = {
          method: "post",
          url: `https://${fmServer}/fmi/data/vLatest/databases/API_External/layouts/Timecard/records`,
          httpsAgent: new https.Agent({
            ca: certifi.where, // use the root certificates from certifi
          }),
          data: {
            fieldData: {
              userId: userId,
              name: name,
              timeStampIn: timeStamp,
              dateIn: date,
              timeIn: time,
              runNumber: runNumber,
              LocationIn: address,
              notesIn: notesIn,
            },
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const result = await axios(entryConfig);
        console.log("Punched in");
        res.send(200, punchStatus);
      } catch (error) {
        console.log("Error on punch in");
        res.send(500, error);
      }
    } else {
      console.log("updating entry");
      const punchStatus = "Punched Out";
      try {
        const updateConfig = {
          method: "patch",
          url: `https://${fmServer}/fmi/data/vLatest/databases/API_External/layouts/Timecard/records/${recordId}`,
          httpsAgent: new https.Agent({
            ca: certifi.where, // use the root certificates from certifi
          }),
          data: {
            fieldData: {
              timeStampOut: timeStamp,
              dateOut: date,
              timeOut: time,
              LocationOut: address,
              notesOut: notesOut,
            },
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const result = await axios(updateConfig);
        console.log("Punched out");
        res.send(200, punchStatus);
      } catch (error) {
        console.log("error on punch out");
        res.send(500, error);
      }
    }
  } else {
    res.send(500, "Incorrect API Password");
  }
};

module.exports = { FilemakerPunch };
