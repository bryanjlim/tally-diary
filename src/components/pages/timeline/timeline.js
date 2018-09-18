import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import CircularProgress from '@material-ui/core/CircularProgress';
import { TimelineCard } from '../../views/diaryEntries/timelineCard';
import '../../../styles.css'
export class Timeline extends Component {

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
        return (
            <div className='centered'>
            <TimelineCard 
                title={entry.title}
                date={entry.date}
                mood={entry.mood}
                weather={entry.weather}
                bodyText={entry.bodyText}
                todos={entry.todos}
                tallies={entry.tallies}
                birthDate={this.props.store.preferences.dateOfBirth}
            />
            </div>
        );
    }

    render() {
        return (
            <div className="timeline">
            { this.state.fileCount > 0 ? this.state.diaryEntryObjects.map(this.eachDiaryEntryObject) : this.state.isFileCountDone ? 
                <div className='centered'><i>There are no diary entries to show</i></div> : <div className='centered'><CircularProgress className='centered'/></div> }
            </div>
        );
    }
}

export default Timeline;
