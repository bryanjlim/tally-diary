import React, { Component } from 'react';
import {Card, withStyles} from '@material-ui/core';
import DiaryEntriesWritten from '../../views/insights/diaryEntriesWritten';
import AllTallies from '../../views/insights/allTallies';
import YearOldDiary from '../../views/insights/yearOldDiary';
import AppLaunches from '../../views/insights/appLaunches';
import PropTypes from 'prop-types';

class Insights extends Component {

    constructor(props) {
        super(props); 

        this.state = { 
            fileCount: 0,
            existsYearOldDiary: false,
            yearOldDiaryIndex: -1,
        }
        this.state.existsYearOldDiary = false;

        // Loops over all entries to determine if a year old diary entry exists
        for(let i = 0; i < this.props.diaryEntryStore.entries.length; i++) {
            const date = new Date(this.props.diaryEntryStore.entries[i].date);

            if(Math.round((new Date() - new Date(date))/ (1000 * 60 * 60 * 24)) - 1 === 365) {
                this.state.existsYearOldDiary = true;
                this.state.yearOldDiaryIndex = i;
            }
        }
    }

    render() { 
        const { classes } = this.props;

        return (
            <div>
                <Card className={classes.insightCard}><AppLaunches appLaunches={this.props.userStore.preferences.appLaunches}/></Card>
                {this.state.existsYearOldDiary ? 
                    <Card className={classes.insightCard}>
                        <YearOldDiary index={this.state.yearOldDiaryIndex} userStore={this.props.userStore} 
                        title={this.props.diaryEntryStore.entries[this.state.yearOldDiaryIndex].title}/>
                    </Card> : 
                null}
                <Card className={classes.insightCard}><DiaryEntriesWritten entryCount={this.props.diaryEntryStore.entries.length}/></Card>
                <Card className={classes.insightCard}><AllTallies diaryEntryStore={this.props.diaryEntryStore}/></Card>
            </div>
        );
    }
}

const styles = theme => ({
    insightCard: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: 50, 
        paddingBottom: 50,
        minWidth: 275,
        maxWidth: 575,
        marginBottom: '2em',
    },
    insightsItemText: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
    }
});

Insights.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Insights);
