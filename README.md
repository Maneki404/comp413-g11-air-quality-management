![image](https://github.com/user-attachments/assets/ba507ffe-a6e2-4516-85b1-b7ad7cddbcb3)

# Air Quality Monitoring System

## Overview

This project is an Air Quality Monitoring System that uses a DHT11 sensor and an MQ135 gas sensor to measure temperature, humidity, and air quality. The data is collected using an ESP32 microcontroller and sent to Firebase for storage. A React Native application is used to visualize the data in real-time and provide historical data access.

### Components

1. **ESP32 Microcontroller**: Collects data from sensors and sends it to Firebase.
2. **DHT11 Sensor**: Measures temperature and humidity.
3. **MQ135 Gas Sensor**: Measures air quality.
4. **Firebase**: Stores sensor data.
5. **React Native App**: Displays real-time and historical data.

## Setup Instructions

### Hardware Setup

1. **Connect the DHT11 Sensor**:
   - Connect the VCC pin to the 3.3V pin on the ESP32.
   - Connect the GND pin to the GND pin on the ESP32.
   - Connect the data pin to GPIO 32 on the ESP32.

2. **Connect the MQ135 Sensor**:
   - Connect the VCC pin to the 3.3V pin on the ESP32.
   - Connect the GND pin to the GND pin on the ESP32.
   - Connect the analog output pin to GPIO 33 on the ESP32.

### Software Setup

1. **Arduino IDE Setup**:
   - Install the ESP32 board package in the Arduino IDE.
   - Install the required libraries: `DHT`, `WiFi`, `Firebase_ESP_Client`.

2. **Firebase Setup**:
   - Create a Firebase project and Firestore database.
   - Obtain the Firebase API key, project ID, and authentication credentials.
   - Update the `config.h` file with your Firebase credentials.

3. **React Native App Setup**:
   - Ensure you have Node.js and Expo CLI installed.
   - Clone the React Native app repository.
   - Install dependencies using `npm install` or `yarn install`.
   - Configure Firebase in the app by adding a fireabase.js file to the root of the project and fill these details:
```
// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { db, auth };

```

### Running the Project

1. **ESP32**:
   - Upload the `air_quality.ino` sketch to the ESP32 using the Arduino IDE.
   - Monitor the serial output to ensure data is being sent to Firebase.

2. **React Native App**:
   - Start the app using `npx expo start`.
   - Use an emulator or a physical device to view the app.

## Hardware List

- ESP32 Development Board
- DHT11 Temperature and Humidity Sensor
- MQ135 Gas Sensor
- Jumper Wires
- Breadboard (optional)

This setup will allow you to monitor air quality and environmental conditions in real-time, with data visualization available through the React Native application.

### Demo & Poster Link

https://drive.google.com/drive/folders/1n1B6MGXv0L9wV3ctgch74ctgy2E3V5pq?usp=sharing
