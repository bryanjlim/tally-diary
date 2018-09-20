import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import {CircularProgress, withStyles} from '@material-ui/core';
import TimelineCard  from '../../views/diaryEntries/timelineCard';
import PropTypes from 'prop-types';


class Timeline extends Component {

    constructor(props) {
        super(props); 
        this.state = {
            fileCount: 0,
            isFileCountDone: false,
            diaryEntryObjects: [],
        }
        this.eachDiaryEntryObject = this.eachDiaryEntryObject.bind(this);
    }

    componentDidMount() {
        DriveHelper.getFileCount().then((count) => {
            if(count > 1) {
                for(let i = count - 1 ; i > 0; i--) {
                    DriveHelper.readFile(i).then((entry) => {
                        console.log(entry);
                        this.setState(prevState => ({
                            diaryEntryObjects: [
                                ...prevState.diaryEntryObjects,
                                {entry}
                            ],
                            fileCount: count,
                            isFileCountDone: true, 
                        }))
                    }).catch(err => console.log(err))
                }
            } else {
                this.setState({
                    isFileCountDone: true,
                });
            }
        })
    }

    eachDiaryEntryObject(diaryEntry, i) {
        const entry = diaryEntry.entry;
        const { classes } = this.props;
        return (
            <div className={classes.timelineCard}>
            <TimelineCard 
                title={entry.title}
                date={entry.date}
                mood={entry.mood}
                weather={entry.weather}
                bodyText={entry.bodyText}
                todos={entry.todos}
                tallies={entry.tallies}
                birthDate={this.props.store.preferences.dateOfBirth}
                index={i}
            />
            </div>
        );
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
            { this.state.fileCount > 0 ? this.state.diaryEntryObjects.map(this.eachDiaryEntryObject) : this.state.isFileCountDone ? 
                <div className={classes.centerText}><i>There are no diary entries to show. It's empty here....</i></div> : <div className={classes.circularProgress}><CircularProgress /></div> }
            </div>
        );
    }
}

const styles = theme => ({
    circularProgress: {
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
    }, 
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
