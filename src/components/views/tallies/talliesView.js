import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Tally from '../../objects/tallies/tally';

const styles = theme => ({
    wrapper: {
        marginLeft: '.5em',
        fontFamily: 'roboto',
    }
});

class TalliesView extends React.Component {

    constructor(props) {
        super(props);

        this.state ={
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
        };

        this.eachTallyObject = this.eachTallyObject.bind(this);
        this.updateTalliesWithCurrentEntry = this.updateTalliesWithCurrentEntry.bind(this);
    }

    componentDidMount() {
        // Iterate through diary entry store to determine tallies
        for(let i = 0; i < this.props.diaryEntryStore.entries.length; i++) {
            for(let j = 0; j < this.props.diaryEntryStore.entries[i].tallies.length; j++) {
                if(!(this.props.diaryEntryStore.entries[i].fileName == this.props.currentFileName)) {
                    // Do not add if tally from current file
                    const tallyMark = this.props.diaryEntryStore.entries[i].tallies[j];

                    let existsInTallies = false;
                    const tallyMarkText = tallyMark.text;
                    const tallyMarkType = tallyMark.type;
                    const stateArrayToUse = tallyMarkType === "Food" ? this.state.storeFoodTallies : tallyMarkType === "People" ? this.state.storePeopleTallies : 
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
        this.updateTalliesWithCurrentEntry();
    }

    updateTalliesWithCurrentEntry() {
        this.setState({
            foodTallies: this.state.storeFoodTallies, 
            peopleTallies: this.state.storePeopleTallies,
            activityTallies: this.state.storeActivityTallies,
            locationTallies: this.state.storeLocationTallies,
            otherTallies: this.state.storeOtherTallies,
        })

        // Iterate through current file's tallies to add to calculated tallies from the diary entry store
        for(let i = 0; i < this.props.currentEntryTallyMarks.length; i++) {
            const tallyMark = this.props.currentEntryTallyMarks[i];

            let existsInTallies = false;
            const tallyMarkText = tallyMark.text;
            const tallyMarkType = tallyMark.type;
            const stateArrayToUse = tallyMarkType === "Food" ? this.state.foodTallies : tallyMarkType === "People" ? this.state.peopleTallies : 
                                    tallyMarkType === "Activity" ? this.state.activityTallies : tallyMarkType === "Location" ? this.state.locationTallies : this.state.otherTallies;

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

    render() {
        const { classes } = this.props;
        alert(this.state.foodTallies.length);
        return (
            <div className={classes.wrapper}>
                <h3><u>Food</u></h3>
                <div>{this.state.foodTallies.map(this.eachTallyObject)}</div>
                {/* <h3><u>People</u></h3>
                <div>{this.state.peopleTallies.map(this.eachTallyObject)}</div>
                <h3><u>Activity</u></h3>
                <div>{this.state.activityTallies.map(this.eachTallyObject)}</div>
                <h3><u>Location</u></h3>
                <div>{this.state.locationTallies.map(this.eachTallyObject)}</div>
                <h3><u>Other</u></h3>
                <div>{this.state.otherTallies.map(this.eachTallyObject)}</div> */}
            </div>
        );
    }

    eachTallyObject(tally) {
        const { classes } = this.props;
        alert(tally);
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