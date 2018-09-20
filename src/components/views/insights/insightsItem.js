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
class InsightsItem extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.insightsItemText}>
                <h2>{this.props.entryCount} diary entries written</h2>
            </div>
        );
    }
}

InsightsItem.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InsightsItem);
