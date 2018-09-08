import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import { InsightsItem } from '../../views/insights/insightsItem';
export class Insights extends Component {

    constructor(props) {
        super(props); 
        this.state = { fileCount: 0 }
    }

    componentDidMount() {
        DriveHelper.getFileCount().then((count) => {
            this.setState({fileCount: count}); 
        })
    }

    render() {
        return (
            <div className="insights">
            { this.state.fileCount == 0 ? <p>Loading... </p> : <InsightsItem entryCount={this.state.fileCount - 1} /> }
            </div>
        );
    }
}

export default Insights;
