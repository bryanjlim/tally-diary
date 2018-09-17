import React, { Component } from 'react';
export class TimelineListItem extends Component {
    render() {
        return (
            <div>
                <h2>Title: {this.props.title}</h2>
                <h2>Date: {this.props.date}</h2>
                <p>Mood: {this.props.mood.mood}</p>
                <p>Body: {this.props.bodyText}</p>
                <p>Tallies: {JSON.stringify(this.props.tallies)}</p>
                <p>Weather: {JSON.stringify(this.props.weather)}</p>
                <p>Days Alive: {Math.round((new Date(this.props.date) - new Date(this.props.birthDate)) / (1000 * 60 * 60 * 24))}</p>
                <span> </span>
            </div>
        );
    }
}

export default TimelineListItem;
