import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import {withStyles} from '@material-ui/core';
import TimelineCard  from '../../views/diaryEntries/timelineCard';
import {Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';

class Timeline extends Component {

    constructor(props) {
        super(props); 

        this.state = {
            redirect: false,
            redirectIndex: -1,
        }

        this.deleteEntry = this.deleteEntry.bind(this);
        this.eachDiaryEntryObject = this.eachDiaryEntryObject.bind(this);
        this.viewSingleEntry = this.viewSingleEntry.bind(this);
    }

    deleteEntry(fileName, index) {
        this.props.diaryEntryStore.entries.splice(index, 1);
        DriveHelper.updateFile(fileName, {'deleted': true});
        this.forceUpdate();
    }

    viewSingleEntry(index) {
        this.setState({
            redirect: true,
            redirectIndex: index,
        })
    }

    eachDiaryEntryObject(diaryEntry, i) {
        const entry = diaryEntry;
        const { classes } = this.props;
        return (
            <div className={classes.timelineCard}>
            <TimelineCard 
                fileName={entry.fileName}
                title={entry.title}
                date={entry.date}
                mood={entry.mood}
                weather={entry.weather}
                bodyText={entry.bodyText}
                todos={entry.todos}
                tallies={entry.tallies}
                birthDate={this.props.userStore.preferences.dateOfBirth}
                index={i}
                viewSingleEntry={this.viewSingleEntry}
                deleteEntry={this.deleteEntry}
            />
            </div>
        );
    }

    render() {
        const { classes } = this.props;

        if(this.state.redirect) {
            const location = "/timeline/" + this.state.redirectIndex;
            return(
                <Redirect to={location} push />
            );
        } else {
            if(this.props.diaryEntryStore.entries.length) {
                return(<div>{this.props.diaryEntryStore.entries.map(this.eachDiaryEntryObject)}</div>);
            } else {
                return(<div className={classes.centerText}><i>There are no diary entries to show. It's empty here....</i></div>);
            } 
        } 
    }
}

const styles = theme => ({
    centerText: {
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
    }, 
    timelineCard: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: 25, 
        minWidth: 275,
        maxWidth: 575,
    },
});

Timeline.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Timeline);
