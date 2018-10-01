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
            foodTallies: [],
            peopleTallies: [],
            activityTallies: [],
            locationTallies: [],
            otherTallies: [],
        };

        this.eachTallyObject = this.eachTallyObject.bind(this);
    }

    componentDidMount() {
        for(let i = 0; i < this.props.diaryEntryStore.entries.length; i++) {
            for(let j = 0; j < this.props.diaryEntryStore.entries[i].tallies.length; j++) {
                if(!this.props.diaryEntryStore.entries[i].fileName === this.props.currentFileName) {
                    // Do not add if tally from current file
                    const tallyMark = this.props.diaryEntryStore.entries[i].tallies[j];

                    let existsInTallies = false;
                    const tallyMarkText = tallyMark.text;
                    const tallyMarkType = tallyMark.type;
                    const stateArrayToUse = tallyMarkType === "Food" ? this.state.foodTallies : tallyMarkType === "People" ? this.state.peopleTallies : 
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
        }
    }

    render() {
        const { classes } = this.props;

        // Handle tallies from current file
        const foodTalliesToUse = this.state.foodTallies;
        const peopleTalliesToUse = this.state.peopleTallies;
        const activityTalliesToUse = this.state.activityTallies;
        const locationTalliesToUse = this.state.locationTallies;
        const otherTalliesToUse = this.state.otherTallies;

        for(let i = 0; i < this.props.currentEntryTallyMarks.length; i++) {
            const tallyMark = this.props.currentEntryTallyMarks[i];

            let existsInTallies = false;
            const tallyMarkText = tallyMark.text;
            const tallyMarkType = tallyMark.type;
            const stateArrayToUse = tallyMarkType === "Food" ? foodTalliesToUse : tallyMarkType === "People" ? peopleTalliesToUse : 
                                    tallyMarkType === "Activity" ? activityTalliesToUse : tallyMarkType === "Location" ? locationTalliesToUse : otherTalliesToUse;

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


        return (
            <div className={classes.wrapper}>
                <h3><u>Food</u></h3>
                <div>{foodTalliesToUse.map(this.eachTallyObject)}</div>
                <h3><u>People</u></h3>
                <div>{peopleTalliesToUse.map(this.eachTallyObject)}</div>
                <h3><u>Activity</u></h3>
                <div>{activityTalliesToUse.map(this.eachTallyObject)}</div>
                <h3><u>Location</u></h3>
                <div>{locationTalliesToUse.map(this.eachTallyObject)}</div>
                <h3><u>Other</u></h3>
                <div>{otherTalliesToUse.map(this.eachTallyObject)}</div>
            </div>
        );
    }

    eachTallyObject(tally) {
        const { classes } = this.props;
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