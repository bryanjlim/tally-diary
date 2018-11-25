import React, { Component } from 'react';
import {withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import 'typeface-roboto';
import logo from './TextLogo.jpg';

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isImageLoaded: false,
        }
        this.onImageLoad = this.onImageLoad.bind(this);
    }

    onImageLoad() {
        this.setState({isImageLoaded: true});
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={this.state.isImageLoaded ? classes.show : classes.hide}>
                <div className={classes.outerContainer}> 
                    <div className={classes.middleContainer}> 
                        <div className={classes.innerContainer}> 
                            <div className={classes.home}>
                                <div className={classes.logoWrapper}><img className={classes.logoImage} onLoad={this.onImageLoad} 
                                    alt="Tally Diary Logo" src={logo}/></div>
                                <h1 className={classes.homeTitle}><i>A Diary to Tally Your Life</i></h1>
                                <div className={classes.centerButton}><button onClick={evt => 
                                    { evt.preventDefault(); this.props.signIn(); }} className={classes.getStartedButton} 
                                    type="submit">Get Started</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const styles = theme => ({
    hide: {
        display: 'none'
    },
    logoImage: {
        display: 'block',
        margin: '0 auto',
        width: 350,
        [theme.breakpoints.down('sm')]: {
            width: 250,
        },
    }, 
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
        marginBottom: '1em',
        [theme.breakpoints.down('sm')]: {
            fontSize: 20,
        },
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
