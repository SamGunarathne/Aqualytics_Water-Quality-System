#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "LittleFS.h"
#include "connect.h"

//WiFi Credentials
const char* ssid = esp_SSID;
const char* password = esp_PASS;

//MQTT Broker
const char* mqtt_server = mqtt_SERVER;
const int mqtt_port = 8883;

const char* mqtt_user = mqtt_UN;
const char* mqtt_pass = mqtt_PASS;

//MQTT Topic
const char* topic = "water/quality";

//Temperature Sensor (DS18B20)
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

//Analog Pins
#define PH_PIN 34
#define TURBIDITY_PIN 35
#define TDS_PIN 32

WiFiClientSecure espClient;
PubSubClient client(espClient);

//Timing
unsigned long lastMsg = 0;
unsigned long lastReconnectAttempt = 0; // Added for non-blocking reconnects
const long interval = 5000; // 5 seconds

// ==========================================
// INITIAL SETUP ONLY
// ==========================================
void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  
  WiFi.begin(ssid, password);

  // This blocking loop is fine for the initial boot-up
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

// ==========================================
// SAVE TO LITTLEFS
// ==========================================
void saveToBuffer(String payload) {
  File file = LittleFS.open("/buffer.txt", FILE_APPEND);
  if (!file) {
    Serial.println("❌ Failed to open buffer file");
    return;
  }
  file.println(payload);
  file.close();
  Serial.println("📁 Data buffered locally");
}

// ==========================================
// REPLAY BUFFERED DATA
// ==========================================
void replayBufferedData() {
  File file = LittleFS.open("/buffer.txt", FILE_READ);
  if (!file || file.size() == 0) {
    Serial.println("✅ No buffered data");
    return;
  }

  Serial.println("🔄 Replaying buffered data...");
  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) {
      bool success = client.publish(topic, line.c_str());
      if (success) {
        Serial.println("✅ Replayed:");
        Serial.println(line);
      } else {
        Serial.println("❌ Replay failed");
        break;
      }
      delay(300);
    }
  }
  file.close();

  // Clear buffer after successful replay
  LittleFS.remove("/buffer.txt");
  Serial.println("🧹 Buffer cleared");
}

// ==========================================
// Sensor Data Calibration and Conversion
// ==========================================
float calibration_value = 21.38 - 1.5;
float stablePH = -1.0; 

float readPH() {
  int samples = 20; 
  float adcSum = 0;

  for (int i = 0; i < samples; i++) {
    adcSum += analogRead(PH_PIN);
    delay(5);
  }

  float avgADC = adcSum / samples;
  float measuredVolt = avgADC * (3.3 / 4095.0);
  float actualSensorVolt = measuredVolt * 1.5;
  float ph = -5.70 * actualSensorVolt + calibration_value;
  
  float alpha = 0.15; 
  if (stablePH < 0) {
    stablePH = ph; 
  } else {
    stablePH = (alpha * ph) + ((1.0 - alpha) * stablePH);
  }
  return stablePH;
}

float readTurbidity() {
  int samples = 20;
  long sum = 0;

  for (int i = 0; i < samples; i++) {
    sum += analogRead(TURBIDITY_PIN);
    delay(5);
  }

  int raw = sum / samples;
  float turbidity = ((3660.0 - raw) / 1560.0) * 300.0;

  if (turbidity < 0) turbidity = 0;
  if (turbidity > 300) turbidity = 300;

  return turbidity;
}

float readTDS(float temperature) {
  int raw = analogRead(TDS_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
  float compensatedVoltage = voltage / compensationCoefficient;
  float tds = (133.42 * pow(compensatedVoltage, 3)
              - 255.86 * pow(compensatedVoltage, 2)
              + 857.39 * compensatedVoltage) * 0.5;

  return tds;
}

// ==========================================
// SETUP
// ==========================================
void setup() {
  Serial.begin(115200);

  if (!LittleFS.begin(true)) {
    Serial.println("❌ LittleFS Mount Failed");
    return;
  }
  Serial.println("✅ LittleFS Ready");

  setup_wifi();
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(1024);
  sensors.begin();
}

// ==========================================
// MAIN LOOP
// ==========================================
void loop() {
  unsigned long now = millis();

  // 1. NON-BLOCKING RECONNECTION LOGIC
  if (WiFi.status() != WL_CONNECTED) {
    // Only attempt WiFi reconnect every 5 seconds so it doesn't crash the config
    if (now - lastReconnectAttempt > 5000) {
      Serial.println("⚠ WiFi Lost - Attempting reconnect...");
      WiFi.reconnect(); 
      lastReconnectAttempt = now;
    }
  } else {
    // WiFi is connected, check MQTT
    if (!client.connected()) {
      // Only attempt MQTT reconnect every 5 seconds
      if (now - lastReconnectAttempt > 5000) {
        Serial.print("Connecting MQTT...");
        if (client.connect("esp32-water-node-001", mqtt_user, mqtt_pass)) {
          Serial.println("MQTT Connected");
          replayBufferedData();
        } else {
          Serial.print("Failed MQTT: ");
          Serial.println(client.state());
        }
        lastReconnectAttempt = now;
      }
    } else {
      // Both connected, process MQTT network traffic
      client.loop();
    }
  }

  // 2. DATA COLLECTION (ALWAYS RUNS, EVEN OFFLINE)
  if (now - lastMsg > interval) {
    lastMsg = now;

    // Read Sensors
    sensors.requestTemperatures();
    float temperature = sensors.getTempCByIndex(0);
    float ph = readPH();
    float turbidity = readTurbidity();
    float tds = readTDS(temperature);

    // Create JSON
    String payload = "{";
    payload += "\"ph\":" + String(ph, 2) + ",";
    payload += "\"temperature\":" + String(temperature, 2) + ",";
    payload += "\"tds\":" + String(tds, 2) + ",";
    payload += "\"turbidity\":" + String(turbidity, 2);
    payload += "}";

    // Assume failure until proven otherwise
    bool success = false;

    // Only attempt to publish if client is actually connected
    if (client.connected()) {
      success = client.publish(topic, payload.c_str());
    }

    // Handle the result
    if (!success) {
      Serial.println("❌ Offline or Publish Failed");
      saveToBuffer(payload);
    } else {
      Serial.println("✅ MQTT Published");
      Serial.println(payload);
    }
  }
}