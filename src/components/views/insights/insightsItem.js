import React, { Component } from 'react';
export class InsightsItem extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.entryCount} diary entries written</h2>
            </div>
        );
    }
}

export default InsightsItem;
