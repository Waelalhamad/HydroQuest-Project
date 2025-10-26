#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <TinyGPS++.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Wi-Fi credentials
const char* ssid = "MAPs";
const char* password = "12345678";

// WebSocket server
WebSocketsClient webSocket;
const char* webSocketServer = "192.168.0.252";  // Node.js server IP
const uint16_t webSocketPort = 3000;

// GPS
SoftwareSerial gpsSerial(D4, D3);  // RX, TX for GPS module
TinyGPSPlus gps;

// Temperature sensor setup
#define ONE_WIRE_BUS D2
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// TDS sensor setup
const int TdsSensorPin = A0;
const float Areference = 3.3;
const int ADCMaxValue = 1024;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);

  // Initialize sensors
  sensors.begin();

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Connect to WebSocket server
  webSocket.begin(webSocketServer, webSocketPort, "/");
  webSocket.onEvent(webSocketEvent);

  // WebSocket auto reconnection
  webSocket.setReconnectInterval(1000);
}

void loop() {
  webSocket.loop();

  // Handle GPS data
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Send data every 500 milliseconds
  static unsigned long lastSendTime = 0;
  if (millis() - lastSendTime > 500) {
    lastSendTime = millis();
    sendSensorData();
  }
}

void sendSensorData() {
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);
  float temperatureK = temperatureC + 273.15;

  // Read TDS sensor value
  int analogValue = analogRead(TdsSensorPin);
  float voltage = (analogValue / (float)ADCMaxValue) * Areference;
  float tdsValue = (voltage / Areference) * 500.0 * 2;

  // Check if GPS has a valid fix
  if (gps.location.isValid()) {
    float latitude = gps.location.lat();
    float longitude = gps.location.lng();
    float speed = gps.speed.kmph();

    // Prepare JSON data
    String jsonData = "{\"temperature_celsius\":" + String(temperatureC) +
                      ", \"temperature_kelvin\":" + String(temperatureK) +
                      ", \"tds_value\":" + String(tdsValue, 2) +
                      ", \"latitude\":" + String(latitude, 6) +
                      ", \"longitude\":" + String(longitude, 6) +
                      ", \"speed\":" + String(speed, 2) + "}";

    // Send data to WebSocket server
    webSocket.sendTXT(jsonData);

    Serial.println("Data sent: " + jsonData);
  } else {
    Serial.println("Waiting for GPS signal...");
  }
}

// Handle WebSocket events
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket server");
      break;
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket server");
      break;
    case WStype_TEXT:
      Serial.printf("Received message: %s\n", payload);
      break;
  }
}
