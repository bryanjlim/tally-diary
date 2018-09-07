import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import { TimelineListItem } from '../../views/diaryEntries/timelineListItem';
export class Timeline extends Component {

    constructor(props) {
        super(props); 
        this.state = {
            fileCount: 0,
            diaryEntryObjects: [],
        }
        this.eachDiaryEntryObject = this.eachDiaryEntryObject.bind(this);
    }

    componentDidMount() {
        DriveHelper.getFileCount().then((count) => {
            this.setState({fileCount: count}); 
            for(let i = count; i > 0; i--) {
                DriveHelper.readFile(i).then((entry) => {
                    console.log(entry);
                    this.setState(prevState => ({
                        diaryEntryObjects: [
                            ...prevState.diaryEntryObjects,
                            {entry}
                        ]
                    }))
                }).catch(err => console.log(err))
            }
        })
    }

    eachDiaryEntryObject(diaryEntry, i) {
        const entry = diaryEntry.entry;
        return (
            <TimelineListItem 
                title={entry.title}
                date={entry.date}
                mood={entry.mood}
                weather={entry.weather}
                bodyText={entry.bodyText}
                todos={entry.todos}
                tallies={entry.tallies}
            />
        );
    }

    render() {
        return (
            <div className="timeline">
            { this.state.fileCount == 0 ? <p>Loading... </p> : this.state.diaryEntryObjects.map(this.eachDiaryEntryObject) }
            </div>
        );
    }
}

export default Timeline;
