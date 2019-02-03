import React, { Component } from 'react';
import {TextField, MenuItem, Card, Button, Grid, Checkbox, FormControlLabel, Snackbar,
        IconButton, withStyles, InputAdornment, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import DriveHelper from '../../helpers/driveHelper';
import DeleteAllFiles from './deleteAllFiles';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import 'typeface-roboto';

function buildFileSelector(){
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('multiple', 'multiple');
    return fileSelector;
}

class Settings extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            showSuccessfulSave: false,
            showErrorSaving: false,
            saveError: '',
            showSuccessfulImport: false,
            showErrorExporting: false,
            showDownloadAttempt: false,
            firstName: '',
            lastName: '',
            dateOfBirth: new Date(),
            primaryTheme: '', //light or dark
            secondaryColor: '', // blue, red, orange, green, purple, or pink
            usePassword: null,
            password: '',
            showPassword: false,
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.updateUserProperties = this.updateUserProperties.bind(this);
        this.closeSuccessSaveSnackBar = this.closeSuccessSaveSnackBar.bind(this);
        this.closeErrorSaveSnackBar = this.closeErrorSaveSnackBar.bind(this);
        this.closeSuccessImportSnackBar = this.closeSuccessImportSnackBar.bind(this);
        this.closeErrorExportSnackBar = this.closeErrorExportSnackBar.bind(this);
        this.closeDownloadAttempt = this.closeDownloadAttempt.bind(this);
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
        this.exportData = this.exportData.bind(this);
        this.handleImportClick = this.handleImportClick.bind(this);
        this.importData = this.importData.bind(this);
    }

    componentDidMount() {
        this.setState({
            ...this.props.userStore.preferences, 
            isLoading: false,
        });

        this.fileSelector = buildFileSelector();
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
          [name]: value
        });
    }

    handleClickShowPassword() {
        this.setState((oldState) => ({
            showPassword: !oldState.showPassword,
        }));
    }

    updateUserProperties(e) {
        e.preventDefault();

        const updatedProperties = {
            "firstName": "test",//this.state.firstName,
            "lastName": this.state.lastName,
            "dateOfBirth": this.state.dateOfBirth,
            "primaryTheme": this.state.primaryTheme,
            "secondaryColor": this.state.secondaryColor,
            "usePassword": this.state.usePassword,
            "password": this.state.password,
            "appLaunches" : 1,
        };
        
        DriveHelper.updateFile("0", updatedProperties).then(() => {
            this.setState({ showSuccessfulSave: true, showErrorSaving: false });
            this.props.userStore.preferences = updatedProperties;
        }).catch((err) => {
            console.log("error saving: " + err);
            this.setState({ showErrorSaving: true, showSuccessfulSave: false, saveError: err});
        });
    }

    exportData(e) {
        e.preventDefault();
        this.setState({
            showDownloadAttempt: true,
        })
        var blob = new Blob([JSON.stringify(this.props.diaryEntryStore.entries)], {type: "text/json"});
        FileSaver.saveAs(blob, "backup.json");
    }

    handleImportClick(e) {
        e.preventDefault(); 
        document.getElementById("fileInput").click(); 
    }

    importData(e) {
        const reader = new FileReader();
        const that = this;

        const input = e.target;
        const file = input.files[0];

        reader.onloadend = function () {
            const entries = JSON.parse(reader.result);
            entries.forEach((entry) => {
                that.props.diaryEntryStore.entries.push(entry);
            })
            DriveHelper.updateEntries(that.props.diaryEntryStore.entries);
            that.setState({
                showSuccessfulImport: true,
            })
        }

        reader.readAsBinaryString(file)
    }

    closeSuccessSaveSnackBar() {
        this.setState({showSuccessfulSave: false}); 
    }

    closeErrorSaveSnackBar() {
        this.setState({showErrorSaving: false}); 
    }

    closeSuccessImportSnackBar() {
        this.setState({showSuccessfulImport: false}); 
    }
    
    closeErrorExportSnackBar() {
        this.setState({showErrorExporting: false}); 
    }

    closeDownloadAttempt() {
        this.setState({showDownloadAttempt: false}); 
    }

    render() {
        const { classes } = this.props;

        if(this.state.isLoading === false) {
            return (
                <div> 
                    {/* File Input */}
                    <input type="file" accept="text/json" style={{ display: 'none' }} id="fileInput" onChange={this.importData} />

                    <Typography variant="h4" className={classes.title}>User Settings</Typography> 

                     <Card className={classes.card}>
                    
                        <Typography variant="h5" className={classes.cardTitle}>User Information and Preferences</Typography> 
                            <Grid container className={classes.grid}>
                                <Grid item className={classes.settingsGridItem}>
                                    <TextField
                                        name="dateOfBirth"
                                        label="Start/Birth Date"
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
                                        {/* <MenuItem value="red">Red</MenuItem>
                                        <MenuItem value="green">Green</MenuItem>
                                        <MenuItem value="orange">Orange</MenuItem>
                                        <MenuItem value="purple">Purple</MenuItem>
                                        <MenuItem value="pink">Pink</MenuItem> */}
                                    </TextField>
                                </Grid>
                                <Grid container className={classes.bottomGrid}>
                                    <Grid item className={classes.settingsGridItem}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    label="Password?"
                                                    name="usePassword"
                                                    color="primary"
                                                    checked={this.state.usePassword}
                                                    onChange={this.handleInputChange}
                                                />
                                            }
                                            label="Use Password"
                                        />
                                    </Grid> 
                                    {this.state.usePassword ? 
                                        <Grid item className={classes.settingsGridItem}>
                                            <TextField
                                                name="password"
                                                label="Password"
                                                className={classes.textField}
                                                type={this.state.showPassword ? 'text' : 'password'}
                                                value={this.state.password}
                                                onChange={this.handleInputChange}
                                                InputProps={{
                                                    endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                        aria-label="Toggle password visibility"
                                                        onClick={this.handleClickShowPassword}
                                                        >
                                                        {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                    ),
                                                }}                                
                                            />
                                        </Grid> : null } 
                                </Grid>
                            </Grid>
                        
                            <Button onClick={this.updateUserProperties} color="primary" className={classes.button}>Update</Button>
                        </Card>
                        <Card className={classes.card}>
                            <Typography variant="h5" className={classes.cardTitle}>Account</Typography> 
                            <Button className={classes.accountButton} color="primary" onClick={evt => 
                                {evt.preventDefault(); this.props.signOut();}}>
                                Sign Out
                            </Button>
                            <div className={classes.accountButton}>
                                <DeleteAllFiles deleteAllFiles={() => {this.setState({isLoading: true}); 
                                                                       DriveHelper.deleteAllFiles();}}/>
                            </div>
                        </Card>

                        <Card className={classes.card}>
                            <Typography variant="h5" className={classes.cardTitle}>Export and Import</Typography> 
                            <Button className={classes.accountButton} color="primary" 
                                    onClick={evt => this.exportData(evt)}>
                                    Download Backup
                            </Button>
                            <Button className={classes.accountButton} color="primary" 
                                    onClick={evt => this.handleImportClick(evt)}>
                                    Import Backup
                            </Button>
                        </Card>

                        <Card className={classes.card}>
                            <Typography variant="h5" className={classes.cardTitle}>Useful Links</Typography> 
                            <Button className={classes.accountButton} color="primary" 
                                    onClick={evt => {evt.preventDefault(); window.location.href='/privacy-policy';}}>
                                    Privacy Policy
                            </Button>
                            <Button className={classes.accountButton} color="primary" 
                                    onClick={evt => {evt.preventDefault(); window.location.href='/about';}}>
                                    About Us
                            </Button>
                            <Button className={classes.accountButton} color="primary" 
                                    onClick={evt => {evt.preventDefault(); window.location.href='/contact';}}>
                                    Contact Us
                            </Button>
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
                                    onClick={this.closeSuccessSaveSnackBar}
                                >
                                    <CloseIcon className={classes.icon} />
                                </IconButton>
                            ]}
                        />
                        <Snackbar
                            open={this.state.showDownloadAttempt}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span>Downloading... Please ensure you are on tallydiary.me</span>}
                            action={[
                                <IconButton
                                    key="close"
                                    aria-label="Close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={this.closeDownloadAttempt}
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
                            message={<span>There was an error saving your settings. Error: {this.state.saveError}</span>}
                            action={[
                                <IconButton
                                    key="close"
                                    aria-label="Close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={this.closeErrorSaveSnackBar}
                                >
                                    <CloseIcon className={classes.icon} />
                                </IconButton>
                            ]}
                        />
                        <Snackbar
                            open={this.state.showErrorExporting}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span>There was an error exporting your diary entries</span>}
                            action={[
                                <IconButton
                                    key="close"
                                    aria-label="Close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={this.closeErrorExportSnackBar}
                                >
                                    <CloseIcon className={classes.icon} />
                                </IconButton>
                            ]}
                        />
                        <Snackbar
                            open={this.state.showSuccessfulImport}
                            ContentProps={{
                                'aria-describedby': 'message-id',
                            }}
                            message={<span>Diary entries from json file successfully added.</span>}
                            action={[
                                <IconButton
                                    key="close"
                                    aria-label="Close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={this.closeSuccessImportSnackBar}
                                >
                                    <CloseIcon className={classes.icon} />
                                </IconButton>
                            ]}
                        />
                </div> 
            );
        }
        return (<div className={classes.middleContainer}><i>Deleting All Files...</i></div>); 
    }
}

const styles = theme => ({
    middleContainer: {
        textAlign: 'center',
        marginTop: '2em',
    },
    title: {
        color: theme.palette.primary.main,
        textAlign: 'center',
        '@media (max-width: 500px)': { 
            fontSize: '2em',
        },
    },
    cardTitle: {
        color: theme.palette.primary.main, 
        marginLeft: '.7em',
        marginTop: '.15em',
        marginBottom: '.5em',
        '@media (max-width: 500px)': { 
            fontSize: '1.5em',
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
    bottomGrid: {
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
        marginTop: '1em',
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
