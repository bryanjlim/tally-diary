/* global gapi */
import React, { Component } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
  MenuItem,
  Card,
  Button,
  Grid,
  Checkbox,
  withStyles
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import DriveHelper from "../../helpers/driveHelper";
import PropTypes from "prop-types";
import "typeface-roboto";

class NewUserSetup extends Component {
  constructor(props) {
    super(props);

    const dateObject = new Date();
    const formattedMonth =
      (dateObject.getMonth() + 1).toString().length === 1
        ? "0" + (dateObject.getMonth() + 1)
        : dateObject.getMonth() + 1;
    const dateNumber = dateObject.getDate();
    const formattedDate = dateNumber / 10 < 1 ? "0" + dateNumber : dateNumber;
    const currentDate =
      dateObject.getFullYear() + "-" + formattedMonth + "-" + formattedDate;

    this.state = {
      firstName: "",
      lastName: "",
      dateOfBirth: currentDate,
      dateOfBirthError: false,
      primaryTheme: "light", //light or dark
      secondaryColor: "blue", // blue, red, orange, green, purple, or pink
      usePassword: false,
      password: "",
      showPassword: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.addUserProperties = this.addUserProperties.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
    this.validate = this.validate.bind(this);
  }

  componentDidMount() {
    const basicProfileInfo = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getBasicProfile();
    this.setState({
      firstName: basicProfileInfo.getGivenName(),
      lastName: basicProfileInfo.getFamilyName()
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleClickShowPassword() {
    this.setState(oldState => ({
      showPassword: !oldState.showPassword
    }));
  }

  validate() {
    if (this.state.dateOfBirth === "") {
      this.setState({ dateOfBirthError: true });
      return false;
    } else {
      if (new Date(this.state.dateOfBirth) < new Date()) {
        this.setState({ dateOfBirthError: false });
        return true;
      }
    }
  }

  addUserProperties(e) {
    e.preventDefault();

    if (!this.state.usePassword) {
      this.setState({ password: "" });
    }

    if (this.validate()) {
      const userData = {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        dateOfBirth: this.state.dateOfBirth,
        appLaunches: 1,
        primaryTheme: this.state.primaryTheme,
        secondaryColor: this.state.secondaryColor,
        usePassword: this.state.usePassword,
        password: this.state.password
      };
      DriveHelper.postUserData(userData);
      DriveHelper.postEntries({ 1: [] }); // Creates empty file for diary entries
      this.props.doneWithSetup(userData);
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.innerContainer}>
        <h1 className={classes.title}>Welcome, {this.state.firstName}!</h1>

        <Card className={classes.card}>
          <h2 className={classes.cardTitle}>
            User Information and Preferences
          </h2>
          <Grid container className={classes.topGrid}>
            <Grid item className={classes.settingsGridItem}>
              <TextField
                name="dateOfBirth"
                label="Start/Birth Date"
                type="date"
                error={this.state.dateOfBirthError}
                helperText={this.state.dateOfBirthError ? "Invalid date" : ""}
                value={this.state.dateOfBirth}
                onChange={this.handleInputChange}
                InputLabelProps={{
                  shrink: true
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
              <label htmlFor="usePassword">Password?</label>
              <Checkbox
                label="Use Password?"
                name="usePassword"
                color="primary"
                checked={this.state.usePassword}
                onChange={this.handleInputChange}
              />
            </Grid>
            {this.state.usePassword ? (
              <Grid item className={classes.settingsGridItem}>
                <TextField
                  name="password"
                  label="Password"
                  className={classes.textField}
                  type={this.state.showPassword ? "text" : "password"}
                  value={this.state.password}
                  onChange={this.handleInputChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Toggle password visibility"
                          onClick={this.handleClickShowPassword}
                        >
                          {this.state.showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            ) : null}
          </Grid>
          <Button onClick={this.addUserProperties} className={classes.button}>
            Let's Begin
          </Button>
        </Card>
        <Card className={classes.card}>
          <div className={classes.privacy}>
            <i>
              <b className={classes.boldNote}>Note: </b>This information is
              stored in your Google Drive's reserved application folder, only
              accessible by the Tally Diary app. Tally Diary will never, ever
              store your data on its own servers.
            </i>
          </div>
        </Card>
      </div>
    );
  }
}

const styles = theme => ({
  innerContainer: {
    fontFamily: "Roboto",
    marginLeft: "auto",
    marginRight: "auto"
  },
  title: {
    color: theme.palette.primary.main,
    textAlign: "center"
  },
  cardTitle: {
    color: theme.palette.primary.main,
    marginLeft: "1em"
  },
  card: {
    maxWidth: 1000,
    minWidth: 100,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "2em",
    paddingBottom: "1em"
  },
  topGrid: {
    marginLeft: "1em",
    marginBottom: "1em"
  },
  bottomGrid: {
    marginLeft: "1em",
    marginBottom: "1em"
  },
  button: {
    color: theme.palette.primary.main,
    float: "right",
    marginRight: "1em"
  },
  settingsGridItem: {
    marginLeft: "1em"
  },
  selector: {
    width: 150,
    marginBottom: "1em"
  },
  boldNote: {
    color: theme.palette.primary.main
  },
  privacy: {
    margin: 15
  }
});

NewUserSetup.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NewUserSetup);
