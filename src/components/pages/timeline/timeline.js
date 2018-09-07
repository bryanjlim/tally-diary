import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
export class Timeline extends Component {

    componentDidMount() {
        DriveHelper.getFilesInAppData();
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
