import React, { Component } from 'react';
import {withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';

const styles = theme => ({
    insightsItemText: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
});
class DiaryEntriesWritten extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.insightsItemText}>
                <h2>Diary Entries Written: {this.props.entryCount}</h2>
                <i>This doesn't include deleted diary entries</i>
            </div>
        );
    }
}

DiaryEntriesWritten.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DiaryEntriesWritten);
