# iBeacon-indoor-positioning-demo
Indoor positioning of iBeacon tags (tagged people, dogs, cats and objects)  with trilateration.

## Mosquitto
Edit mosquitto-demo.conf -file. Set the path to acl files, like:

acl_file /home/w3/Downloads/iBeacon-indoor-positioning-demo/mosquitto_acl.config
password_file /home/w3/Downloads/iBeacon-indoor-positioning-demo/mosquitto_pw.config

Start mosquitto with command:
mosquitto -v -c ./mosquitto-demo.conf

MQTT users are "station" and "dashboard" and all passwords are "bledemo".

See https://github.com/jpmens/mosquitto-auth-plug

## ESP32 stations
ESP32 modules will work as iBeacon monitoring stations, reporting all found beacons to MQTT topic, with their MAC address and RSSI.

## Dashboard

Dashboard is a simple React app, connecting to MQTT server (mosquitto) and showing each beacon on screen.
Beacons are shown on a map (office/home floor plan).

![Screenshot](https://github.com/jarkko-hautakorpi/iBeacon-indoor-positioning-demo/blob/master/screenshot.jpg)

##TODO
* improve accuracy (average value, faster beacons, sync stations)
* add beacon MAC whitelist to sidebar
* add server settings to sidebar
* add properties to beacon icons
* connect to iTAG's
* ... what else?
