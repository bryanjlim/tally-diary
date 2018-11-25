import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import {withStyles, IconButton, Grid} from '@material-ui/core';
import TimelineCard  from '../../views/diaryEntries/timelineCard';
import TimelineHeadline  from '../../views/diaryEntries/timelineHeadline';
import {Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import AddFilters from './addFilters';
import {ViewHeadline, ViewHeadlineOutlined, ViewList, ViewListOutlined} from '@material-ui/icons';

class Timeline extends Component {

    constructor(props) {
        super(props); 

        this.state = {
            cardView: true,
            diaryEntriesToShow: this.props.diaryEntryStore.entries,
            redirect: false,
            redirectIndex: -1,
        }

        this.deleteEntry = this.deleteEntry.bind(this);
        this.eachDiaryEntryObject = this.eachDiaryEntryObject.bind(this);
        this.viewSingleEntry = this.viewSingleEntry.bind(this);
        this.toggleView = this.toggleView.bind(this);
        this.filter = this.filter.bind(this);
    }

    deleteEntry(fileName, index) {
        this.props.diaryEntryStore.entries.splice(index, 1);
        DriveHelper.updateEntries(this.props.diaryEntryStore.entries);
        this.forceUpdate();
    }

    viewSingleEntry(index) {
        this.setState({
            redirect: true,
            redirectIndex: index,
        })
    }

    toggleView() {
        const view = !this.state.cardView;
        this.setState({
            cardView: view,
        })
    }

    filter(startDate, endDate, bodyTextFilter, todoFilter, tallyFilter,) {
        this.setState({diaryEntriesToShow: [], });

        for(let i = 0; i < this.props.diaryEntryStore.entries.length; i++) {
            let addEntry = true;
            const entry = this.props.diaryEntryStore.entries[i]; 

            // Determine if entry should be added to list of entries shown in timeline
            if(startDate !== null && endDate !== null) {
                if(new Date(entry.date) < startDate || new Date(entry.date) > new Date(endDate)) {
                    addEntry = false;
                }
            } else if(startDate !== null && endDate === null) {
                if(new Date(entry.date) < new Date(startDate)) {
                    addEntry = false;
                }
            } else if(startDate === null && endDate !== null) {
                if(new Date(entry.date) > new Date(endDate)) {
                    addEntry = false;
                }
            } 
            
            if(entry.bodyText !== null && entry.bodyText !== undefined && bodyTextFilter !== '') {
                if(!entry.bodyText.includes(bodyTextFilter)) {
                    addEntry = false;
                }
            }
            if(todoFilter !== '') {
                let containsTodo = false;
                for(let i = 0; i < entry.todos.length; i++) {
                    if(entry.todos[i].text === todoFilter) {
                        containsTodo = true;
                    }
                }
                if(!containsTodo) {
                    addEntry = false;
                }
            }
            if(tallyFilter !== '') {
                let containsTally = false;
                for(let i = 0; i < entry.tallies.length; i++) {
                    if(entry.tallies[i].text === tallyFilter) {
                        containsTally = true;
                    }
                }
                if(!containsTally) {
                    addEntry = false;
                }
            }

            if(addEntry) {
                this.setState(prevState => ({
                    diaryEntriesToShow: [...prevState.diaryEntriesToShow, entry]
                }))
            }
        }
    }

    eachDiaryEntryObject(diaryEntry, i) {
        const entry = diaryEntry;
        const { classes } = this.props;

        return (
            <div className={classes.timelineCard}>
            {this.state.cardView ? 
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
                /> :
                <TimelineHeadline 
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
            }
            
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
                return(
                    <div>
                        <div className={classes.centerTop}>
                            <Grid container>
                                <Grid item className={classes.topClusterObject} style={{marginRight: '3em'}}>
                                    <AddFilters userStore={this.props.userStore} filter={this.filter}/>
                                </Grid>
                                <Grid item className={classes.topClusterObject} style={{marginTop: '-.4em'}}>
                                    <IconButton aria-label="Card View" onClick={this.toggleView} disabled={this.state.cardView}>
                                        {this.state.cardView ? <ViewList/> : <ViewListOutlined/>}
                                    </IconButton>
                                </Grid>
                                <Grid item className={classes.topClusterObject} style={{marginTop: '-.4em'}}>
                                    <IconButton aria-label="List View" onClick={this.toggleView} disabled={!this.state.cardView}>
                                        {this.state.cardView ? <ViewHeadlineOutlined/> : <ViewHeadline/>}
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </div>
                        <div className={classes.showingItalic}>
                            <i>Showing {this.state.diaryEntriesToShow.length} entries</i>
                        </div>
                        {this.state.diaryEntriesToShow.map(this.eachDiaryEntryObject)}
                    </div>
                );
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
    centerTop: {
        marginLeft: 'auto',
        marginRight: 'auto',
        minWidth: 275,
        maxWidth: 575,
        whiteSpace: 'no-wrap',
    },
    topClusterObject: {
        marginRight: '.5em',
    },
    timelineCard: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: 25, 
        minWidth: 275,
        maxWidth: 575,
        [theme.breakpoints.down('xs')]: {
            marginLeft: '-1em',
            marginTop: '-1em',
        },
    },
    showingItalic: {
        textAlign: 'center',
        marginTop: '2em',
    }
});

Timeline.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Timeline);
