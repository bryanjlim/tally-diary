import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import { TimelineListItem } from '../../views/diaryEntries/timelineListItem';
export class Timeline extends Component {

    constructor(props) {
        super(props); 
        this.state = {
            diaryEntryObjects: [],
        }
    }

    componentDidMount() {
        DriveHelper.getFileCount().then((count) => {
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
        alert(JSON.stringify(entry));
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
                {this.state.diaryEntryObjects.map(this.eachDiaryEntryObject)}
            </div>
        );
    }
}

export default Timeline;
