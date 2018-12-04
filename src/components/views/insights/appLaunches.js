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
class AppLaunches extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.insightsItemText}>
                {this.props.appLaunches == 1 ? 
                <h2>You've launched Tally Diary Once</h2>
              : <h2>You've launched Tally Diary {this.props.appLaunches} Times</h2>}
            </div>
        );
    }
}

AppLaunches.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppLaunches);
