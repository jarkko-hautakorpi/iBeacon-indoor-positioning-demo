#include <sstream>
#include <string>

#include <WiFi.h>
#define MQTT_MAX_PACKET_SIZE 1844
#include <PubSubClient.h>
// Bluetooth LE
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

/* Add WiFi and MQTT credentials to credentials.h file */
#include "credentials.h"


#ifdef __cplusplus
extern "C" {
#endif
  uint8_t temprature_sens_read();
#ifdef __cplusplus
}
#endif

//Scan time must be longer than beacon interval
int beaconScanTime = 4;
WiFiClient espClient;
PubSubClient client(espClient);

// We collect each device MAC and RSSI
typedef struct {
  char address[17];   // 67:f1:d2:04:cd:5d
  int rssi;
} BeaconData;

uint8_t bufferIndex = 0;  // Found devices counter
BeaconData buffer[50];    // Buffer to store found device data
uint8_t message_char_buffer[MQTT_MAX_PACKET_SIZE];

/*
 * Construct SenML compatible message with multiple measurements
 * see:
 * https://tools.ietf.org/html/draft-jennings-senml-10
 * Internal temp sensor:
 * https://github.com/pcbreflux/espressif/blob/master/esp32/arduino/sketchbook/ESP32_int_temp_sensor/ESP32_int_temp_sensor.ino
 */

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
public:

  void onResult(BLEAdvertisedDevice advertisedDevice) {
    extern uint8_t bufferIndex;
    extern BeaconData buffer[];
    if(bufferIndex >= 50) {
      return;
    }
    // RSSI
    if(advertisedDevice.haveRSSI()) {
      buffer[bufferIndex].rssi = advertisedDevice.getRSSI();
    } else { buffer[bufferIndex].rssi =  0; }
    
    // MAC is mandatory for BT to work
    strcpy (buffer[bufferIndex].address, advertisedDevice.getAddress().toString().c_str());
    
    bufferIndex++;
    // Print everything via serial port for debugging
    Serial.printf("MAC: %s \n", advertisedDevice.getAddress().toString().c_str());
    Serial.printf("name: %s \n", advertisedDevice.getName().c_str());
    Serial.printf("RSSI: %d \n", advertisedDevice.getRSSI());
  }
};

void setup() {
  Serial.begin(115200);
  BLEDevice::init(""); // Can only be called once
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
}

void connectMQTT() {
  client.setServer(mqttServer, mqttPort);
  Serial.println("Connecting to MQTT...");
  if (client.connect("ESP32Client", mqttUser, mqttPassword)) {
    Serial.println("connected");
  } else {
    Serial.print("failed with state ");
    Serial.print(client.state());
    delay(2000);
  }
}

void ScanBeacons() {
  delay(1000);
  BLEScan* pBLEScan = BLEDevice::getScan(); //create new scan
  MyAdvertisedDeviceCallbacks cb;
  pBLEScan->setAdvertisedDeviceCallbacks(&cb);
  pBLEScan->setActiveScan(true); //active scan uses more power, but get results faster
  BLEScanResults foundDevices = pBLEScan->start(beaconScanTime);
  Serial.print("Devices found: ");
  //Serial.print(cb.getConcatedMessage());
  for (uint8_t i = 0; i < bufferIndex; i++) {
    Serial.print(buffer[i].address);
    Serial.print(" : ");
    Serial.println(buffer[i].rssi);
  }
  
  // Stop BLE
  pBLEScan->stop();
  delay(1000);
  Serial.println("Scan done!");
}

void loop() {
  boolean result;
  // Scan Beacons
  ScanBeacons();
  // Reconnect WiFi if not connected
  while (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  
  // Reconnect to MQTT if not connected
  while (!client.connected()) {
    connectMQTT();
  }
  client.loop();
  
  // SenML begins
  String payloadString = "{\"e\":[";
  for(uint8_t i = 0; i < bufferIndex; i++) {
    payloadString += "{\"m\":\"";
    payloadString += String(buffer[i].address);
    payloadString += "\",\"r\":\"";
    payloadString += String(buffer[i].rssi);
    payloadString += "\"}";
    if(i < bufferIndex-1) {
      payloadString += ',';
    }
  }
  // SenML ends. Add this stations MAC
  payloadString += "],\"st\":\"";
  payloadString += String(WiFi.macAddress());
  // Add board temperature in fahrenheit
  payloadString += "\",\"t\":\"";
  payloadString += String(temprature_sens_read());
  payloadString += "\"}";
  
  // Print and publish payload
  Serial.print("MAX len: ");
  Serial.println(MQTT_MAX_PACKET_SIZE);
  
  Serial.print("Payload length: ");
  Serial.println(payloadString.length());
  Serial.println(payloadString);
  
  payloadString.getBytes(message_char_buffer, payloadString.length()+1);
  result = client.publish("/beacons/office", message_char_buffer, payloadString.length(), false);
  Serial.print("PUB Result: ");
  Serial.println(result);
  
  //Start over the scan loop
  bufferIndex = 0;
  // Add delay to slow down publishing frequency if needed.
  //delay(5000);
}
