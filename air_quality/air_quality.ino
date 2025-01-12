#include <DHT.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <time.h>
#include "config.h"

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

#define DHTPIN 32          
#define DHTTYPE DHT11      
#define MQ135_PIN 33       

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

DHT dht(DHTPIN, DHTTYPE);

const char* ntpServer = "tr.pool.ntp.org";  // Turkish NTP server
const long  gmtOffset_sec = 10800;          // UTC+3 (3 * 3600 seconds)
const int   daylightOffset_sec = 0;         // No additional daylight saving offset

unsigned long dataMillis = 0;

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("\nStarting...");

  pinMode(MQ135_PIN, INPUT);
  dht.begin();

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Configure time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // Initialize Firebase
  config.api_key = FIREBASE_API_KEY;
  
  // Required for authentication
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.ready() && (millis() - dataMillis > 10000 || dataMillis == 0)) {
    dataMillis = millis();
    
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    int mq135Value = analogRead(MQ135_PIN);

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Get timestamp
    time_t now;
    time(&now);
    char timestamp[30];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", localtime(&now));

    FirebaseJson content;
    
    content.set("fields/humidity/doubleValue", String(humidity).c_str());
    content.set("fields/temperature/doubleValue", String(temperature).c_str());
    content.set("fields/airQuality/integerValue", String(mq135Value).c_str());
    content.set("fields/timestamp/stringValue", timestamp);

    String documentPath = "sensor_readings/" + String(now);

    Serial.print("Sending to Firebase... ");
    if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), content.raw())) {
      Serial.println("Success!");
      Serial.printf("Temperature: %.2f°C\n", temperature);
      Serial.printf("Humidity: %.2f%%\n", humidity);
      Serial.printf("Air Quality: %d\n", mq135Value);
    } else {
      Serial.println("Failed");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }
}