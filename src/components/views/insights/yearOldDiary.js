import React, { Component } from 'react';
import {withStyles, CardActions, Button, Typography} from '@material-ui/core';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';

const styles = theme => ({
    insightsItemText: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    title: {
        marginTop: '.2em',
        marginBottom: '.5em',
    }
});

class YearOldDiary extends Component {

    constructor(props) {
        super(props); 

        this.state = {
            redirect: false,
        }
        this.viewSingleEntry = this.viewSingleEntry.bind(this);
    }

    viewSingleEntry() {
        this.setState({
            redirect: true,
        })
    }

    render() {
        const { classes } = this.props;

        if(this.state.redirect) {
            const location = "/timeline/" + this.props.index;
            return(
                <Redirect to={location} push/>
            );
        } else {
            const daysAlive = Math.round((new Date() - new Date(this.props.userStore.preferences.dateOfBirth)) / (1000 * 60 * 60 * 24)) - 366;

            return (
                <div className={classes.insightsItemText}>
                    <Typography className={classes.title} variant="h5">You wrote a diary entry one year ago!</Typography>
                    <Typography variant="caption">Day {this.props.title === '' ? daysAlive : daysAlive + "(" + this.props.title + ")"}</Typography>
                    <CardActions>
                        <Button onClick={this.viewSingleEntry} size="small" style={{marginLeft: 'auto', marginRight: 'auto',}}>View Entry</Button>
                    </CardActions>
                </div>
            );
        }        
    }
}

YearOldDiary.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(YearOldDiary);
