import React, { Component } from 'react';
import {withStyles, Typography} from '@material-ui/core';
import PropTypes from 'prop-types';

const styles = theme => ({
    insightsItemText: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    diaryEntriesWritten: {
        marginBottom: '.5em',
    }
});
class DiaryEntriesWritten extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.insightsItemText}>
                <Typography className={classes.diaryEntriesWritten} variant="h5">Diary Entries Written: {this.props.entryCount}</Typography>
                <Typography variant="overline">This doesn't include deleted diary entries</Typography>
            </div>
        );
    }
}

DiaryEntriesWritten.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DiaryEntriesWritten);
