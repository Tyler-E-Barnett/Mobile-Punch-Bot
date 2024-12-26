const axios = require("axios");

let runs = [];
let runNum = "";

exports.getRuns = async (url, userId) => {
  console.log("getting Runs");
  try {
    const res = await axios.get(url + `/runs/${userId}`);
    runs = res.data;
  } catch (err) {
    console.log(err);
  }
  return runs;
};

// exports.getRuns = getRuns;
