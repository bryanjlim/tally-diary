/* global gapi */
import React, { Component } from 'react';
import Drive from '../../helpers/drive';
export class Timeline extends Component {

    componentDidMount() {
        Drive.getFilesInAppData();
    }

    render() {
        return (
            <div>
                <h1>Timeline</h1>
            </div>
        );
    }
}

export default Timeline;
