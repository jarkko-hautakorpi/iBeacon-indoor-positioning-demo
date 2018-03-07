import trilat from "trilat/index.js";

export const locate  = (beacon, stations, px_meter) => {

    // ITAG -70 ... -94
    // Samsung -73 ... -95

    // RSSI = TxPower - 10 * n * lg(d)
    // n = 2...4
    // d = 10^(TxPower - RSSI) / (10 * n))

    function calculateDistance(rssi) {
        let P = -69; // @TODO This value should come from MQTT message
        let n = 3;
        let d = Math.pow(10, ((P-rssi) / (10*n)) ); //(n ranges from 2 to 4)
        return d*px_meter;
    }

    var keysSorted = Object.keys(beacon).sort(function (a, b) {
        return beacon[a].rssi - beacon[b].rssi
    });
    keysSorted.reverse();

    let input = [
        //      X     Y     R
        [ parseInt(stations[keysSorted[0]].x, 10), parseInt(stations[keysSorted[0]].y, 10), calculateDistance(beacon[keysSorted[0]].rssi)],
        [ parseInt(stations[keysSorted[1]].x, 10), parseInt(stations[keysSorted[1]].y, 10), calculateDistance(beacon[keysSorted[1]].rssi)],
        [ parseInt(stations[keysSorted[2]].x, 10), parseInt(stations[keysSorted[2]].y, 10), calculateDistance(beacon[keysSorted[2]].rssi)]
    ];

    let output = trilat(input);
    let coords = {
        x: parseInt(output[0], 10),
        y: parseInt(output[1], 10)
    };
    return coords;
};
