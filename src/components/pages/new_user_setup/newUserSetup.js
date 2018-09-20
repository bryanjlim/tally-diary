/* global gapi */
import React, { Component } from 'react';
import {TextField, MenuItem, Card, Button, Grid, Checkbox, withStyles } from '@material-ui/core';
import DriveHelper from '../../helpers/driveHelper';
import PropTypes from 'prop-types';
import 'typeface-roboto';

class NewUserSetup extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            dateOfBirthError: false,
            primaryTheme: "light", //light or dark
            secondaryColor: "blue", // blue, red, orange, green, purple, or pink
            usePin: false,
            pin: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.addUserProperties = this.addUserProperties.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentDidMount() {
        const basicProfileInfo = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        this.setState({
            firstName: basicProfileInfo.getGivenName(),
            lastName: basicProfileInfo.getFamilyName(),
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

    validate() {
        if(this.state.dateOfBirth === '') {
            this.setState({dateOfBirthError: true});
            return false;
        } else {
            if(new Date(this.state.dateOfBirth) < new Date()) {
                this.setState({dateOfBirthError: false});
                return true;
            }
        }
    }

    addUserProperties(e) {
        e.preventDefault();

        if(!this.state.usePin) {
            this.setState({pin: ''});
        }

        if(this.validate()){
            const userData = {
                "firstName": this.state.firstName, 
                "lastName": this.state.lastName,
                "dateOfBirth": this.state.dateOfBirth,
                "primaryTheme": this.state.primaryTheme, 
                "secondaryColor": this.state.secondaryColor, 
                "usePin": this.state.usePin,
                "pin": this.state.pin
            };
            DriveHelper.postUserData(userData);
            this.props.doneWithSetup(userData);
        }
    }
    
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.outerContainer}> 
            <div className={classes.middleContainer}> 
            <div className={classes.innerContainer}> 
                <h1 className={classes.title}>Welcome To Tally Diary, {this.state.firstName}!</h1>

                    <Card className={classes.card}>
                
                    <h2 className={classes.cardTitle}>User Information and Preferences</h2>
                        <Grid container className={classes.topGrid}>
                            <Grid item className={classes.settingsGridItem}>
                                <TextField
                                    name="dateOfBirth"
                                    label="Date of Birth"
                                    type="date"
                                    error={this.state.dateOfBirthError}
                                    helperText={this.state.dateOfBirthError ? 'Invalid date' : ''}
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
                        </Grid>

                        <Grid container className={classes.bottomGrid}>
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
                            {this.state.usePin ? 
                                <Grid item className={classes.settingsGridItem}>
                                    <TextField
                                        name="pin"
                                        label="Pin"
                                        className={classes.textField}
                                        type="password"
                                        value={this.state.pin}
                                        onChange={this.handleInputChange}
                                    />
                                </Grid> : null } 
                        </Grid>
                    
                        <Button onClick={this.addUserProperties} className={classes.button}>Let's Begin</Button>
                    </Card>
                    <Card className={classes.card}>
                        <div className={classes.privacy}><i><b className={classes.boldNote}>Note: </b>This information is stored in your Google Drive's reserved application folder, only accessible by the Tally Diary app. Tally Diary never and will never store your data on its own servers. So no, we don't even store your email.</i></div>
                    </Card>
            </div> 
            </div> 
            </div> 
        );
    }
}

const styles = theme => ({
    outerContainer: {
        backgroundColor: theme.palette.background.default,
        fontFamily: 'Roboto',
        display: 'table',
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
    middleContainer: {
        display: 'table-cell',
        verticalAlign: 'middle',
    },
    innerContainer: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    title: {
        color: theme.palette.primary.main,
        textAlign: 'center',
    },
    cardTitle: {
        color: theme.palette.primary.main,
        marginLeft: '1em',
    }, 
    card: {
        maxWidth: 1000, 
        minWidth: 100,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '2em',
        paddingBottom: '1em',
    },
    topGrid: {
        marginLeft: '1em',
        marginBottom: '1em',
    },
    bottomGrid: {
        marginLeft: '1.75em',
        marginBottom: '1em',
    },
    button: {
        color: theme.palette.primary.main,
        float: 'right',
        marginRight: '1em',
    },
    settingsGridItem: {
        marginLeft: '1em',
    }, 
    selector: {
        width: 150,
    },
    boldNote: {
        color: theme.palette.primary.main,
    },
    privacy: {
        margin: 15,
    }
});

NewUserSetup.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NewUserSetup);
