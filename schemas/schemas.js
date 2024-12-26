const mongoose = require("mongoose");

//checkIn Schema
const checkInSchema = new mongoose.Schema({
  emsId: String,
  userId: String,
  name: String,
  timeStampIn: String,
  dateIn: String,
  timeIn: String,
  timeStampOut: String,
  dateOut: String,
  timeOut: String,
  runNumber: Number,
  notesIn: String,
  notesOut: String,
  locationIn: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  locationOut: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
});

// Check in Model
exports.Punch = mongoose.model("Punch", checkInSchema);

const runSchema = new mongoose.Schema({
  runNumber: Number,
  runDate: String,
  sentDate: String,
  vehicle: String,
  description: String,
  crew: [
    {
      name: String,
      userId: String,
    },
  ],
});

// const runSchema = new mongoose.Schema({
//   runNumber: Number,
//   runDate: String,
//   sentDate: String,
// });

exports.Run = mongoose.model("Run", runSchema);

// module.exports { Punch, Run };
