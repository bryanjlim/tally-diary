import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import { withStyles } from '@material-ui/core';
import TimelineCard  from '../../views/diaryEntries/timelineCard';
import Entry from '../entry/entry';
import PropTypes from 'prop-types';

class Timeline extends Component {

    constructor(props) {
        super(props); 
        this.state = {
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
        this.viewSingleEntry = this.viewSingleEntry.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
        this.viewTimeline = this.viewTimeline.bind(this);
        this.eachDiaryEntryObject = this.eachDiaryEntryObject.bind(this);
        this.getTalliesForEntry = this.getTalliesForEntry.bind(this);
    }

    viewSingleEntry(fileName, timelineCardIndex, title, date, mood, weather, bodyText, todos) {
        const tallies = this.getTalliesForEntry(fileName);

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

    getTalliesForEntry(fileName) {
        const tallies = [];
        for(let i = 0; i < this.props.tallyStore.tallyMarks.length; i++) {
            if(this.props.tallyStore.tallyMarks[i].entryFileName == fileName) {
                tallies.push(this.props.tallyStore.tallyMarks[i]);
            }
        }
        return tallies; 
    }

    deleteEntry(fileName, timelineCardIndex) {
        this.props.diaryEntryStore.entries.splice(timelineCardIndex, 1);
        DriveHelper.updateFile(fileName, {'deleted': true});
    }

    viewTimeline(){
        DriveHelper.readFile(this.state.singleEntryFileName).then((entry) => {
            const fileName = this.props.diaryEntryStore.entries[this.state.singleEntryTimelineCardIndex].fileName;
            entry.fileName = fileName;
            this.props.diaryEntryStore.entries[this.state.singleEntryTimelineCardIndex] = entry;

            this.setState({
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
                    userStore={this.props.userStore}
                    tallyStore={this.props.tallyStore}
                    back={this.viewTimeline}
                /> 
            );
        } else {
            if(this.props.diaryEntryStore.entries.length > 0) {
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
