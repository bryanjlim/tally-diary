import React, { Component } from 'react';
import {withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';
import TalliesView from '../tallies/talliesView';

const styles = theme => ({
    insightsItemText: {
        marginLeft: '2em',
        textAlign: 'left',
        [theme.breakpoints.down('sm')]: {
            marginLeft: '.5em',
        },
    },
    centerText: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
});
class AllTallies extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div>
                <div className={classes.insightsItemText}>
                <h2 className={classes.centerText}>Your Tallies</h2>
                    <TalliesView currentFileName={null} 
                        currentEntryTallyMarks={[]} diaryEntryStore={this.props.diaryEntryStore}/>
                </div>
            </div>
        );
    }
}

AllTallies.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AllTallies);
