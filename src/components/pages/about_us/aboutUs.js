import React, { Component } from 'react';
import { withStyles, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import 'typeface-roboto';

class AboutUs extends Component {

    constructor(props) {
        super(props);
    }

    handleButtonClick(e) {
        e.preventDefault(); 
        window.location.href='/';
    }

    render() {
        const { classes } = this.props;

        return (
            <div>
                <div>
                    <div className={classes.policy}>
                    <Typography variant="h3" gutterBottom>
                            About Us
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            Why Tally Diary Exists
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Tally Diary is a completely free diary app that’s trying to provide all the features the premium diary apps have. There are a lot of diary apps out there, but many hide features behind pay walls, contain bloat, or don’t look modern. Tally Diary was also inspired by an excerpt from “How to Make a Spaceship” where a diary was kept by days alive instead of the regular date system. This was expanded to not only tally days alive but also anything a person can think of.
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            The Team
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Tally Diary is an open-source project but has mainly been a collaboration between a group of friends, mainly university students wanting to create a good diary app that they could personally use. As of 2018, contributors to Tally Diary include:
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            -	Founder: <a href="https://github.com/bryanjlim/">Bryan Lim</a>, University of Washington – Seattle 
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            -	<a href="https://github.com/pfhgetty">Preston Lee</a>, University of Washington – Seattle 
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            -	<a href="https://github.com/missingno01">Ray Altenberg,</a> University of California – Berkeley  
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            -	<a href="https://github.com/alanbrilliant/">Alan Brilliant</a>, University of California – Santa Cruz
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            -	<a href="https://github.com/elmmo">Elizabeth Min</a>, Whitworth University
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            -	<a href="https://github.com/alankbi">Alan Bi</a>, Founder of Teamscode
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            -	Designer: Aedan Henry, Issaquah Robotics Society Captain
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            Transparency
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Anyone can view Tally Diary’s GitHub page <a href="https://github.com/bryanjlim/tally-diary">here</a> to propose new features, report issues, and verify our compliance with our privacy policy.
                        </Typography>
                    </div>
                    <div className={classes.centerButton}><button onClick={this.handleButtonClick} className={classes.getStartedButton} 
                                    type="submit">Return To Tally Diary</button></div>
                </div>
            </div>
        );
    }
}

const styles = theme => ({
    policy: {
        width: 600,
        [theme.breakpoints.down('sm')]: {
            width: 350,
        },
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: '1em',
        paddingBottom: '1em',
    },
    centerButton: {
        marginTop: '1em',
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

AboutUs.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AboutUs);
