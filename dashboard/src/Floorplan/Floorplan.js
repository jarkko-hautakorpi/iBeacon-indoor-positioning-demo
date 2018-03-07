import React from 'react';
import floor_image_file from '../img/appartment_floorplan.jpg';
import './Floorplan.css';
import Pin from './BeaconPin';
import Station from '../Satellite/Satellite';
import {locate} from '../Positioner/PositionCalculator.js';


class Floorimage extends React.Component {
    constructor(props) {
        super(props);
        this.coords = {};
        const sta = localStorage.getItem('stations');
        if(typeof sta === 'undefined') {
            // init first
        } else {
            this.state = {
                stations: JSON.parse(sta)
            };
        }
        this.updateBeaconPositions();
    };

    stationPosition = function(p) {
        console.log(p);
        let sta = this.props.stations;
        sta[p.mac] = {
            x: p.x,
            y: p.y
        };
        this.setState({stations: sta});
        localStorage.setItem('stations', JSON.stringify(sta));
    };

    updateBeaconPositions = function() {
        // Beacons
        this.beaconCoords = {};
        if (this.props.beacons) {
            let b = this.props.beacons;
            for (var key in b) {
                if(Object.keys(b[key]).length >= 3 && Object.keys(this.props.stations).length >= 3) {
                    // CALCULATE POSITION COORDINATES
                    let coords = locate(b[key], this.props.stations, (this.props.width / this.props.widthMeters));
                    if(coords !== null) {
                        this.beaconCoords[key] = coords;
                    } else {
                        console.log("Failed to locate:");
                        console.debug(b[key]);
                    }
                } else {

                }
            }
        }
    };

    render() {
        let stationIcons;
        let beaconIcons;
        // Stations
        let sta = this.props.stations;
        console.log("Floorplan.js, num stations: "+Object.keys(this.props.stations).length);
        if (Object.keys(this.props.stations).length >= 3) {
            stationIcons = Object.keys(sta).map(key =>
                <Station key={key} mac={key} x={sta[key].x} y={sta[key].y} setPosiotionCallback={this.stationPosition.bind(this)}></Station>
            )
        }
        // Beacons
        this.updateBeaconPositions();
        if(Object.keys(this.beaconCoords).length > 0) {
            beaconIcons = Object.keys(this.beaconCoords).map(key =>
                <Pin key={key} mac={key} x={this.beaconCoords[key].x} y={this.beaconCoords[key].y}></Pin>
            );
        }
        return (
            <svg className="floorplan" viewBox={"0 0 " + this.props.width + " " + this.props.height}
                 width={this.props.width} height={this.props.height}
                 style={{backgroundImage: "url(" + floor_image_file + ")"}}>
                {beaconIcons}
                {stationIcons}
            </svg>
        );
    }
}

export default Floorimage;
