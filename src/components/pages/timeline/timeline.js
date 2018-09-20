import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import {CircularProgress, withStyles} from '@material-ui/core';
import TimelineCard  from '../../views/diaryEntries/timelineCard';
import Entry from '../entry/entry';
import PropTypes from 'prop-types';

class Timeline extends Component {

    constructor(props) {
        super(props); 
        this.state = {
            fileCount: 0,
            isFileCountDone: false,
            diaryEntryObjects: [],

            // View Single Diary Entry
            viewSingleEntry: false,
            singleEntryFileName: '',
            singleEntryTimelineCardIndex:'',
            singleEntryTitle:'',
            singleEntryDate:'',
            singleEntryMood:'',
            singleEntryWeather:'',
            singleEntryBodyText:'',
            singleEntryTodos: [],
            singleEntryTallies: '',
        }
        this.eachDiaryEntryObject = this.eachDiaryEntryObject.bind(this);
        this.viewSingleEntry = this.viewSingleEntry.bind(this);
        this.viewTimeline = this.viewTimeline.bind(this);
    }

    viewSingleEntry(fileName, timelineCardIndex, title, date, mood, weather, bodyText, todos, tallies) {
        this.setState({
            viewSingleEntry: true,
            singleEntryFileName: fileName,
            singleEntryTimelineCardIndex: timelineCardIndex,
            singleEntryTitle: title,
            singleEntryDate: date,
            singleEntryMood: mood,
            singleEntryWeather: weather,
            singleEntryBodyText: bodyText,
            singleEntryTodos: todos,
            singleEntryTallies: tallies,
        });
    }

    viewTimeline(){
        DriveHelper.readFile(this.state.singleEntryFileName).then((entry) => {
            const diaryEntryObjectsCopy = this.state.diaryEntryObjects;
            diaryEntryObjectsCopy[this.state.singleEntryTimelineCardIndex] = {entry};
            this.setState({
                diaryEntryObjects: diaryEntryObjectsCopy,
                viewSingleEntry: false,
                singleEntryFileName: '',
                singleEntryTimelineCardIndex:'',
                singleEntryTitle:'',
                singleEntryDate:'',
                singleEntryMood:'',
                singleEntryWeather:'',
                singleEntryBodyText:'',
                singleEntryTodos: [],
                singleEntryTallies: '',
            }); 
        });
    }

    componentDidMount() {
        DriveHelper.getFileCount().then((count) => {
            if(count > 1) {
                for(let i = count - 1 ; i > 0; i--) {
                    DriveHelper.readFile(i).then((entry) => {
                        entry.fileName=i;
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
                fileName={entry.fileName}
                title={entry.title}
                date={entry.date}
                mood={entry.mood}
                weather={entry.weather}
                bodyText={entry.bodyText}
                todos={entry.todos}
                tallies={entry.tallies}
                birthDate={this.props.store.preferences.dateOfBirth}
                index={i}
                viewSingleEntry={this.viewSingleEntry}
            />
            </div>
        );
    }

    render() {
        const { classes } = this.props;

        if(this.state.viewSingleEntry) {
            return (
                <Entry 
                    adding={false}
                    fileName={this.state.singleEntryFileName}
                    index={this.state.singleEntryTimelineCardIndex}
                    title={this.state.singleEntryTitle}
                    date={this.state.singleEntryDate}
                    mood={this.state.singleEntryMood}
                    weather={this.state.singleEntryWeather}
                    bodyText={this.state.singleEntryBodyText}
                    todos={this.state.singleEntryTodos}
                    tallies={this.state.singleEntryTallies}
                    store={this.props.store}
                    back={this.viewTimeline}
                /> 
            );


        } else {
            return (
                <div>
                { this.state.fileCount > 0 ? this.state.diaryEntryObjects.map(this.eachDiaryEntryObject) : this.state.isFileCountDone ? 
                    <div className={classes.centerText}><i>There are no diary entries to show. It's empty here....</i></div> : <div className={classes.circularProgress}><CircularProgress /></div> }
                </div>
            );
        }
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
