/* global gapi */
import React, { Component } from 'react';
import {TextField, MenuItem, Card, Button, Grid, Checkbox, Snackbar, IconButton, withStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DriveHelper from '../../helpers/driveHelper';
import DeleteAllFiles from './deleteAllFiles';
import PropTypes from 'prop-types';
import 'typeface-roboto';

class Settings extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            showSuccessfulSave: false,
            showErrorSaving: false,
            firstName: '',
            lastName: '',
            dateOfBirth: new Date(),
            primaryTheme: '', //light or dark
            secondaryColor: '', // blue, red, orange, green, purple, or pink
            usePin: null,
            pin: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.updateUserProperties = this.updateUserProperties.bind(this);
        this.closeSuccessSnackBar = this.closeSuccessSnackBar.bind(this);
        this.closeErrorSnackBar = this.closeErrorSnackBar.bind(this);
    }

    componentDidMount() {
        this.setState({
            ...this.props.userStore.preferences, 
            isLoading: false,
        });
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
          [name]: value
        });
    }

    updateUserProperties(e) {
        e.preventDefault();

        const updatedProperties = {
            "fistName": this.state.firstName,
            "lastName": this.state.lastName,
            "dateOfBirth": this.state.dateOfBirth,
            "primaryTheme": this.state.primaryTheme,
            "secondaryColor": this.state.secondaryColor,
            "usePin": this.state.usePin,
            "pin": this.state.pin,
        };
        DriveHelper.updateFile("0", updatedProperties).then(() => {
            console.log("successfully updated");
            this.setState({ showSuccessfulSave: true, showErrorSaving: false });
            this.props.userStore.preferences = updatedProperties;
        }).catch((err) => {
            console.log("error saving: " + err);
            this.setState({ showErrorSaving: true, showSuccessfulSave: false});
        });
    }

    closeSuccessSnackBar() {
        this.setState({showSuccessfulSave: false}); 
    }

    closeErrorSnackBar() {
        this.setState({showErrorSaving: false}); 
    }
    
    render() {

        const { classes } = this.props;

        if(this.state.isLoading === false) {
            return (
                <div> 
                    <h1 className={classes.title}>User Settings</h1>

                     <Card className={classes.card}>
                    
                        <h2 className={classes.cardTitle}>User Information and Preferences</h2>
                            <Grid container className={classes.grid}>
                                <Grid item className={classes.settingsGridItem}>
                                    <TextField
                                        name="dateOfBirth"
                                        label="Date of Birth"
                                        type="date"
                                        value={this.state.dateOfBirth}
                                        onChange={this.handleInputChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    /> 
                                </Grid>
                                <Grid item className={classes.settingsGridItem}>
                                    <TextField
                                        label="Primary Theme"
                                        name="primaryTheme"
                                        value={this.state.primaryTheme}
                                        className={classes.selector}
                                        onChange={this.handleInputChange}
                                        select
                                    >
                                        <MenuItem value="light">Light</MenuItem>
                                        <MenuItem value="dark">Dark</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item className={classes.settingsGridItem}>
                                    <TextField
                                        label="Secondary Color"
                                        name="secondaryColor"
                                        value={this.state.secondaryColor}
                                        className={classes.selector}
                                        onChange={this.handleInputChange}
                                        select
                                    >
                                        <MenuItem value="blue">Blue</MenuItem>
                                        <MenuItem value="red">Red</MenuItem>
                                        <MenuItem value="green">Green</MenuItem>
                                        <MenuItem value="orange">Orange</MenuItem>
                                        <MenuItem value="purple">Purple</MenuItem>
                                        <MenuItem value="pink">Pink</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item className={classes.settingsGridItem}>
                                    <label htmlFor="usePin">Use Pin?</label>
                                    <Checkbox
                                        label="Use Pin?"
                                        name="usePin"
                                        color="primary"
                                        checked={this.state.usePin}
                                        onChange={this.handleInputChange}
                                    />
                                </Grid>
                                <Grid item className={this.state.usePin ? classes.settingsGridItem : classes.hide}>
                                    <TextField
                                        name="pin"
                                        label="Pin"
                                        className={classes.textField}
                                        type="password"
                                        value={this.state.pin}
                                        onChange={this.handleInputChange}
                                    />
                                </Grid>
                            </Grid>
                        
                            <Button onClick={this.updateUserProperties} color="primary" className={classes.button}>Update</Button>
                        </Card>
                        <Card className={classes.card}>
                            <h2 className={classes.cardTitle}>Account</h2>
                            <Button className={classes.accountButton} color="primary" onClick={evt => {evt.preventDefault(); this.props.signOut();}}>Sign Out</Button>
                            <div className={classes.accountButton}><DeleteAllFiles deleteAllFiles={DriveHelper.deleteAllFiles}/></div>
                        </Card>

                        <Snackbar
                            open={this.state.showSuccessfulSave}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span>Settings were successfully updated!</span>}
                            action={[
                                <IconButton
                                    key="close"
                                    aria-label="Close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={this.closeSuccessSnackBar}
                                >
                                    <CloseIcon className={classes.icon} />
                                </IconButton>
                            ]}
                        />
                        <Snackbar
                            open={this.state.showErrorSaving}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span>There was an error saving your settings. Please try again.</span>}
                            action={[
                                <IconButton
                                    key="close"
                                    aria-label="Close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={this.closeErrorSnackBar}
                                >
                                    <CloseIcon className={classes.icon} />
                                </IconButton>
                            ]}
                        />
                </div> 
            );
        }
        return null;
    }
}

const styles = theme => ({
    title: {
        color: theme.palette.primary.main,
        textAlign: 'center',
        '@media (max-width: 500px)': { 
            fontSize: '1.7em',
        },
    },
    cardTitle: {
        color: theme.palette.primary.main, 
        marginLeft: '1em',
        '@media (max-width: 500px)': { 
            fontSize: '1.3em',
            marginLeft: '.5em',
        },
    }, 
    card: {
        fontFamily: 'Roboto',
        maxWidth: 1000, 
        minWidth: 100,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '2em',
        paddingBottom: '1em',
    },
    grid: {
        marginLeft: '1em',
        marginBottom: '1em',
        '@media (max-width: 500px)': { 
            marginLeft: '.5em',
        },
    },
    button: {
        marginLeft: '1em',
        '@media (max-width: 500px)': { 
            marginLeft: '.5em',
        },
    },
    accountButton: {
        marginLeft: '1em',
        display: 'inline-block',
        '@media (max-width: 500px)': { 
            marginLeft: '.5em',
        },
    },
    settingsGridItem: {
        marginLeft: '1em',
        marginRight: '1em',
        '@media (max-width: 500px)': { 
            marginLeft: '.5em',
        },
    }, 
    selector: {
        width: 150,
    },
    hide: {
        display: 'none',
    }
});

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Settings);
