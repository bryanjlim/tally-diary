import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import {withStyles} from '@material-ui/core';
import TimelineCard  from '../../views/diaryEntries/timelineCard';
import Entry from '../entry/entry';
import PropTypes from 'prop-types';

class Timeline extends Component {

    constructor(props) {
        super(props); 

        const entryIndex = this.props.entryIndex;

        this.state = {
            singleEntryFileName: this.props.diaryEntryStore.entries[entryIndex].fileName,
            singleEntryIndex: entryIndex,
            singleEntryTitle: this.props.diaryEntryStore.entries[entryIndex].title,
            singleEntryDate: this.props.diaryEntryStore.entries[entryIndex].date,
            singleEntryMood: this.props.diaryEntryStore.entries[entryIndex].mood,
            singleEntryWeather: this.props.diaryEntryStore.entries[entryIndex].weather,
            singleEntryBodyText: this.props.diaryEntryStore.entries[entryIndex].bodyText,
            singleEntryTodos: this.props.diaryEntryStore.entries[entryIndex].todos,
            singleEntryTallies: this.props.diaryEntryStore.entries[entryIndex].tallies,
        }

        this.viewTimeline = this.viewTimeline.bind(this);
    }

    viewTimeline() {
        window.location = '/timeline'
    }

    render() {
        const { classes } = this.props;

        return (
            <Entry 
                adding={false}
                fileName={this.state.singleEntryFileName}
                index={this.state.singleEntryIndex}
                title={this.state.singleEntryTitle}
                date={this.state.singleEntryDate}
                mood={this.state.singleEntryMood}
                weather={this.state.singleEntryWeather}
                bodyText={this.state.singleEntryBodyText}
                todos={this.state.singleEntryTodos}
                tallies={this.state.singleEntryTallies}
                userStore={this.props.userStore}
                diaryEntryStore={this.props.diaryEntryStore}
                back={this.viewTimeline}
            /> 
        );
    }
}

const styles = theme => ({
    centerText: {
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
    }, 
});

Timeline.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Timeline);
