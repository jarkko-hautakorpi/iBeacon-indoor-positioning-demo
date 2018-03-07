import React, {Component} from 'react';
import Bullseye from '../SVGIconComponents/BullsEye';

import './Satellite.css';

class Satellite extends Component {
    state = {
        x: this.props.x,
        y: this.props.y,
        mac: this.props.mac
    };

    handleMouseDown = (e) => {
        this.coords = {
            x: e.pageX,
            y: e.pageY
        };
        document.addEventListener('mousemove', this.handleMouseMove);
    };

    handleMouseUp = () => {
        document.removeEventListener('mousemove', this.handleMouseMove);
        this.coords = {};
        this.props.setPosiotionCallback({x: this.state.x, y: this.state.y, mac: this.props.mac});
    };

    handleMouseMove = (e) => {
        const xDiff = this.coords.x - e.pageX;
        const yDiff = this.coords.y - e.pageY;

        this.coords.x = e.pageX;
        this.coords.y = e.pageY;

        this.setState({
            x: this.state.x - xDiff,
            y: this.state.y - yDiff
        });
    };

    render() {
        const {x, y, mac} = this.state;
        return (
            <svg className="satellite-icon" width="60px"
                 height="30px"
                 x={x}
                 y={y}
                 onMouseDown={this.handleMouseDown}
                 onMouseUp={this.handleMouseUp}>
                <Bullseye />
                <text x="0" y="30px">{mac.substr(9, 9).toUpperCase()}</text>
            </svg>
        )
    }
}

export default Satellite;