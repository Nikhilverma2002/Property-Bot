const mongoose = require("mongoose");

const dataModel = mongoose.Schema({
  name: String,
  // contact: String,
  wsp_contact: String,
  type: String,
  property_type: String,
  preference: String
});

module.exports = mongoose.model("WhatsappChatBot", dataModel);
