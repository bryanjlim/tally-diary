import React, { Component } from 'react';
import { withStyles, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import 'typeface-roboto';

class PrivacyPolicy extends Component {

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
                            Privacy Policy
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            User Data
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            All personal data is stored in a user's own Google Drive app data folder, a hidden folder that Tally Diary may access given the user's explicit permission. Tally Diary does not store any personal information or information that may be associated with a user anywhere that is not the user's Google Drive's app data folder.
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            Data Usage
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            All personal data is stored in a user's own Google Drive app data folder, and that data will only be accessible by the user's own Google account. Tally Diary cannot directly access this data and so cannot, and will never, communicate a user's data to a 3rd party.
                        </Typography>
                        <Typography variant="h4" gutterBottom>
                            Google Ads
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Google, as a third party vendor, uses cookies to serve ads.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Google's use of the DART cookie enables it to serve ads to visitors based on their visit to sites they visit on the Internet.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Website visitors may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.
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

PrivacyPolicy.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PrivacyPolicy);
