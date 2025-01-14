  # Property Bot

Property Bot is a WhatsApp chatbot designed to assist users in finding property-related information based on their current location. This project leverages the WhatsApp API, geolocation features, and a database of property listings to provide relevant data quickly and efficiently.

---

## Features

- **WhatsApp Integration**: Seamless interaction with users through the WhatsApp API.
- **Location-Based Search**: Uses geolocation to identify the user's current location and fetch nearby property data.
- **User-Friendly Interaction**: Guides users to input relevant details like property type, location, and some preferences.
- **Real-Time Data**: Delivers up-to-date property information from the database.

---

## Technologies Used

- **Node.js**: Backend development and API integration.
- **WhatsApp API**: For chatbot functionality and message handling.
- **Geolocation**: To determine user location and provide location-based results.
- **Database**: (MongoDB)To store and retrieve property information.
- **Gupshup**: It is used as webhook holder for running our chatbot 24/7.

---

## How It Works

1. **User Interaction**:
   - The user starts a chat with the bot on WhatsApp by sending just a **Hi/Hello**.
   - The bot prompts the user to share their location and input preferences.
2. **Data Retrieval**:
   - Based on the user's input and location, the bot queries the database for matching properties.
3. **Response**:
   - The bot sends a list of available properties links.

---

## ENV

API_KEY = "GUPSHUP_API_KEY"
API_URL = "GUPSHUP_API_URL"
PHONE = "+917084570845"

---

## Contributing

Contributions are welcome! Feel free to fork this repository, make changes, and submit a pull request. Ensure that your code adheres to the existing coding standards.
