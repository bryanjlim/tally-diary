import React, { Component } from 'react';
import {withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import 'typeface-roboto';

class Home extends Component {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.outerContainer}> 
            <div className={classes.middleContainer}> 
            <div className={classes.innerContainer}> 
                <div className={classes.home}>
                    <h1 className={classes.homeTitle}>Tally - A Diary that Tallies Your Life</h1>
                    <div className={classes.centerButton}><button onClick={evt => { evt.preventDefault(); this.props.signIn(); }} className={classes.getStartedButton} type="submit">Get Started</button></div>
                </div>
            </div>
            </div>
            </div>
        );
    }
}

const styles = theme => ({
    outerContainer: {
        fontFamily: 'Roboto',
        display: 'table',
        position: 'absolute',
        height: '98%',
        width: '98%',
    },
    middleContainer: {
        display: 'table-cell',
        verticalAlign: 'middle',
    },
    innerContainer: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    home: {
        fontFamily: 'Roboto',
    },
    homeTitle: {
        color: theme.palette.primary.main,
        textAlign: 'center',
        margin: '.55em',
    },
    centerButton: {
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
    },
    getStartedButton: {
        display: 'inline-block',
        border: 'none',
        padding: '1rem 2rem',
        margin: '0',
        textDecoration: 'none',
        background: 'none',
        color: theme.palette.primary.main,
        fontSize: '1rem',
        cursor: 'pointer',
        textAlign: 'center',
        outline: '1px solid' + theme.palette.primary.main,
        transition: 'background 250ms ease-in-out, transform 150ms ease,', 
        '&:hover': {
            backgroundColor: theme.palette.primary.main, 
            color: 'white',
        }
    }, 
});

Home.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
