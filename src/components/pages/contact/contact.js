import React, { Component } from 'react';
import { withStyles, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import 'typeface-roboto';

class Contact extends Component {

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
                            Contact Us
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            GitHub
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Please report any issues or feature requests on our GitHub page <a href="https://github.com/bryanjlim/tally-diary">here</a>.
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            Email
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            <a href="mailto:tallydiary@outlook.com">tallydiary@outlook.com</a>
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

Contact.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Contact);
