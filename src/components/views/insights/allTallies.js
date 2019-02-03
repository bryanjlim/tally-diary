import React, { Component } from 'react';
import {withStyles, Typography} from '@material-ui/core';
import PropTypes from 'prop-types';
import TalliesView from '../tallies/talliesView';

const styles = theme => ({
    insightsItemText: {
        textAlign: 'left',
        marginLeft: '1em',
        marginRight: '1em',
        [theme.breakpoints.down('sm')]: {
            marginLeft: '.5em',
            marginRight: '.5em',
        },
    },
    centerText: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: '.7em',
    },
    yourTallies: {
        marginBottom: '.5em',
        marginTop: '-1em', 
    }
});
class AllTallies extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div>
                <div className={classes.insightsItemText}>
                    <Typography variant="h5" className={classes.yourTallies}>Your Tallies</Typography>
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
