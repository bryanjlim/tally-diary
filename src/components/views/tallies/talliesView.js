import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Tally from '../../objects/tallies/tally';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


const styles = theme => ({
    wrapper: {
        fontFamily: 'roboto',
    }
});

class TalliesView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            storeFoodTallies: [],
            storePeopleTallies: [],
            storeActivityTallies: [],
            storeLocationTallies: [],
            storeOtherTallies: [],
            foodTallies: [],
            peopleTallies: [],
            activityTallies: [],
            locationTallies: [],
            otherTallies: [],
            currentDiaryEntryTallyCount: null,
        };

        this.eachTallyObject = this.eachTallyObject.bind(this);
        this.updateTalliesWithCurrentEntry = this.updateTalliesWithCurrentEntry.bind(this);
    }

    componentWillMount() {
        // Iterate through diary entry store to determine tallies
        for(let i = 0; i < this.props.diaryEntryStore.entries.length; i++) {
            for(let j = 0; j < this.props.diaryEntryStore.entries[i].tallies.length; j++) {
                if(!(this.props.diaryEntryStore.entries[i].fileName === this.props.currentFileName)) {
                    // Do not add if tally from current file
                    let existsInTallies = false;
                    const tallyMark = this.props.diaryEntryStore.entries[i].tallies[j];
                    const tallyMarkText = tallyMark.text;
                    const tallyMarkType = tallyMark.type;
                    const stateArrayToUse = tallyMarkType === "Food" ? this.state.storeFoodTallies : tallyMarkType === "Person" ? this.state.storePeopleTallies : 
                                            tallyMarkType === "Activity" ? this.state.storeActivityTallies : tallyMarkType === "Location" ? this.state.storeLocationTallies : this.state.storeOtherTallies;
    
                    const stateArrayToUseLength = stateArrayToUse.length;
                    for(let j = 0; j < stateArrayToUseLength; j++) {
                        if(!existsInTallies) {
                            if(stateArrayToUse[j].text === tallyMarkText) {
                                stateArrayToUse[j].count++;
                                existsInTallies = true;
                            }
                        }
                    }
                    if(!existsInTallies) {
                        // If not currently in the tallies field, add to array
                        stateArrayToUse.push(new Tally(tallyMarkText, 1));
                    }
                }                
            }
        }
    }

    updateTalliesWithCurrentEntry() {
        this.state.currentDiaryEntryTallyCount = this.props.currentEntryTallyMarks.length;
        this.state.foodTallies = this.state.storeFoodTallies.slice(0);
        this.state.peopleTallies = this.state.storePeopleTallies.slice(0);
        this.state.activityTallies = this.state.storeActivityTallies.slice(0);
        this.state.locationTallies = this.state.storeLocationTallies.slice(0);
        this.state.otherTallies = this.state.storeOtherTallies.slice(0);

        // Iterate through current file's tallies to add to calculated tallies from the diary entry store
        for(let i = 0; i < this.props.currentEntryTallyMarks.length; i++) {
            let existsInTallies = false;
            const tallyMark = this.props.currentEntryTallyMarks[i];
            const tallyMarkText = tallyMark.text;
            const tallyMarkType = tallyMark.type;
            const stateArrayToUse = tallyMarkType === "Food" ? this.state.foodTallies : tallyMarkType === "Person" ? this.state.peopleTallies : 
                                    tallyMarkType === "Activity" ? this.state.activityTallies : tallyMarkType === "Location" ? this.state.locationTallies : this.state.otherTallies;
            for(let j = 0; j < stateArrayToUse.length; j++) {
                if(!existsInTallies) {
                    if(stateArrayToUse[j].text === tallyMarkText) {
                        stateArrayToUse[j].count++;
                        existsInTallies = true;
                    }
                }
            }
            if(!existsInTallies) {
                // If not currently in the tallies field, add to array
                stateArrayToUse.push(new Tally(tallyMarkText, 1));
            }
        }
    }
    

    render() {
        if(this.state.currentDiaryEntryTallyCount !== this.props.currentEntryTallyMarks.length) {
            this.updateTalliesWithCurrentEntry();
        }

        const { classes } = this.props;
        return (
            <div className={classes.wrapper}>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>Food</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    <Typography>
                        {this.state.foodTallies.map(this.eachTallyObject)}
                    </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>People</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    <Typography>
                        {this.state.peopleTallies.map(this.eachTallyObject)}
                    </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>Activities</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    <Typography>
                        {this.state.activityTallies.map(this.eachTallyObject)}
                    </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>Locations</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    <Typography>
                        {this.state.locationTallies.map(this.eachTallyObject)}
                    </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>Other</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    <Typography>
                        {this.state.otherTallies.map(this.eachTallyObject)}
                    </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        );
    }

    eachTallyObject(tally) {
        return (
            <div>
                <p>{tally.text}: {tally.count}</p> 
            </div>
        );
    }
}

TalliesView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TalliesView);