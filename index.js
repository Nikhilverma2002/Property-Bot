const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
const { URLSearchParams } = require("url");
const db = require("./db");
const dataModel = require("./model");
const mongoose = require("mongoose");
require("dotenv").config();

let name, wsp_contact, property_type, type, preference;

const app = express().use(body_parser.json());
const users = {}; // Store user contexts

const firstmsg = {
  type: "quick_reply",
  msgid: "qr1",
  content: {
    type: "text",
    header: "Hi! Welcome to Property-Bot please select your preference",
    text: "this is the body",
    caption: "this is the footer",
  },
  options: [
    {
      type: "text",
      title: "BUY",
      postbackText: "dev-defined-postback1",
    },
    {
      type: "text",
      title: "SELL",
      postbackText: "dev-defined-postback2",
    },
    {
      type: "text",
      title: "RENT",
      postbackText: "dev-defined-postback3",
    },
  ],
};

const secondmsg = {
  type: "list",
  title: "Please specify the property type",
  body: "You will be presented with a list of options to choose from",
  msgid: "list1",
  globalButtons: [
    {
      type: "text",
      title: "Global button",
    },
  ],
  items: [
    {
      title: "choose what you want",
      options: [
        {
          type: "text",
          title: "Residential",
          // "description": "first row of first section description",
          // "postbackText": "section 1 row 1 postback payload"
        },
        {
          type: "text",
          title: "Commercial",
          // "description": "second row of first section description",
          // "postbackText": "section 1 row 2 postback payload"
        },
        {
          type: "text",
          title: "Agriculture",
          // "description": "third row of first section description",
          // "postbackText": "section 1 row 3 postback payload"
        },
      ],
    },
  ],
};

const thirsmsg = {
  type: "list",
  title: "Please specify your required property ",
  body: "You will be presented with a list of options to choose from",
  msgid: "list1",
  globalButtons: [{ type: "text", title: "Choose" }],
  items: [
    {
      title: "Choose",
      subtitle: "",
      options: [
        { type: "text", title: "House", description: "", postbackText: "" },
        { type: "text", title: "Flat", description: "", postbackText: "" },
        { type: "text", title: "Plot", description: "", postbackText: "" },
        { type: "text", title: "Shop", description: "", postbackText: "" },
        {
          type: "text",
          title: "Office Space",
          description: "",
          postbackText: "",
        },
        { type: "text", title: "Villa", description: "", postbackText: "" },
        {
          type: "text",
          title: "Agriculture/Farmland",
          description: "",
          postbackText: "",
        },
        {
          type: "text",
          title: "Farmhouse",
          description: "",
          postbackText: "",
        },
      ],
    },
  ],
};

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let verify = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && verify === mytoken) {
      res.status(200).send(challenge);
      return;
    } else {
      res.status(403).send(challenge);
      return;
    }
  }
});

app.post("/webhook", async (req, res) => {
  const payload = req.body.payload;
  console.log(payload);
  const user = payload.sender?.phone;
  name = payload.sender?.name;
  wsp_contact = user;
  let userContext = users[user];

  if (!userContext) {
    userContext = {
      initialHiReceived: false,
      userActionProcessed: false,
      third: false,
      forth: false,
      fifth: false,
      sixth: false,
    };
    users[user] = userContext;
  }

  const messageText = payload.payload?.text;

  if (payload || payload.type === "sandbox-start") {
    if (messageText === "hi") {
      if (userContext.initialHiReceived && userContext.userActionProcessed) {
        // User said "hi" again, restart the flow
        userContext = {
          initialHiReceived: false,
          userActionProcessed: false,
          third: false,
          forth: false,
          fifth: false,
          sixth: false,
        };
        users[user] = userContext;
      }

      sendWhatsAppMessage(user, firstmsg);
      userContext.initialHiReceived = true;
    } else if (messageText === "hi" && !userContext.initialHiReceived) {
      sendWhatsAppMessage(user, firstmsg);
      userContext.initialHiReceived = true;
    } else if (
      payload.type === "button_reply" &&
      !userContext.userActionProcessed
    ) {
      const response = secondmsg;
      const selectedOption = payload.payload.title;
      if (
        selectedOption === "BUY" ||
        selectedOption === "SELL" ||
        selectedOption === "RENT"
      ) {
        type = selectedOption;
        handleUserSelection(user, selectedOption, response, userContext);
        userContext.userActionProcessed = true;
      }
    } else if (payload.type === "list_reply" && !userContext.third) {
      const response = thirsmsg;
      const selectedOption = payload.payload.title;
      if (
        selectedOption === "Residential" ||
        selectedOption === "Commercial" ||
        selectedOption === "Agriculture"
      ) {
        property_type = selectedOption;
        details_selection(user, selectedOption, response, userContext);
        userContext.third = true;
      }
    } else if (payload.type === "list_reply" && !userContext.forth) {
      const response = {
        type: "text",
        text: "Thanks for your cooperation. We have registered your query. Our representative will connect to you shortly. Till then, visit Property-Bot.in and download our application: https://rb.gy/wruig ",
      };
      const selectedOption = payload.payload.title;
      if (
        selectedOption === "House" ||
        selectedOption === "Flat" ||
        selectedOption === "Plot" ||
        selectedOption === "Shop" ||
        selectedOption === "Office Space" ||
        selectedOption === "Villa" ||
        selectedOption === "Agriculture/Farmland"
      ) {
        preference = selectedOption;
        extra_details_selection(user, selectedOption, response, userContext);
        const userdata = dataModel({
          name,
          wsp_contact,
          type,
          property_type,
          preference,
        });
        await userdata.save();

        userContext.forth = true;
      }
    }
    res.status(200).send("");
  }
});

app.listen(9090, async () => {
  await mongoose.db;
  console.log("Webhook is listening");
});

function handleUserSelection(user, selectedOption, response, userContext) {
  if (
    selectedOption === "BUY" ||
    selectedOption === "SELL" ||
    selectedOption === "RENT"
  ) {
    sendWhatsAppMessage(user, response);
  } else {
    console.log(`Received response: ${selectedOption}`);
  }
}

function details_selection(user, selectedOption, response, userContext) {
  if (
    selectedOption === "Residential" ||
    selectedOption === "Commercial" ||
    selectedOption === "Agriculture"
  ) {
    sendWhatsAppMessage(user, response);
  } else {
    console.log(`Received response: ${selectedOption}`);
  }
}

function extra_details_selection(user, selectedOption, response, userContext) {
  if (
    selectedOption === "House" ||
    selectedOption === "Flat" ||
    selectedOption === "Plot" ||
    selectedOption === "Shop" ||
    selectedOption === "Office Space" ||
    selectedOption === "Villa" ||
    selectedOption === "Agriculture/Farmland"
  ) {
    sendWhatsAppMessage(user, response);
  } else {
    console.log(`Received response: ${selectedOption}`);
  }
}

function sendWhatsAppMessage(to, message) {
  const messageString = JSON.stringify(message);
  const encodedParams = new URLSearchParams();
  encodedParams.set("channel", "whatsapp");
  encodedParams.set("source", process.env.PHONE);
  encodedParams.set("destination", to);
  encodedParams.set("message", messageString);
  encodedParams.set("src.name", "Property-Bot");
  encodedParams.set("disablePreview", "false");
  encodedParams.set("encode", "false");

  const options = {
    method: "POST",
    url: process.env.API_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      ApiKey: process.env.API_KEY,
    },
    data: encodedParams.toString(),
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);.
    })
    .catch(function (error) {
      console.error(error);
    });
}
