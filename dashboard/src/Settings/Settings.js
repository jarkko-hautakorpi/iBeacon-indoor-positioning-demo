import React, {Component} from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import './Settings.css';

class SettingsSidemenu extends Component {

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        var all = [];
        var known = [];

        var allBeacons = this.props.beacons;
        if(Object.keys(allBeacons).length > 0) {
            all = Object.keys(allBeacons).map(key =>
                <li key={allBeacons[key].mac}>{allBeacons[key].mac}</li>
            )
        }

        return (
            <div>
                <Menu.Item name='unhide'>
                    <Icon name='unhide' />
                    <ul className='known-beacons-list'>{known}</ul>
                </Menu.Item>
                <Menu.Item name='hide'>
                    <Icon name='hide' />
                    <ul className='all-beacons-list'>{all}</ul>
                </Menu.Item>
            </div>
        );
    }
}

export default SettingsSidemenu;