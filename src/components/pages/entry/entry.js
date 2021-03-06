import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  TextField,
  IconButton,
  Snackbar,
  Divider,
  Grid,
  Paper,
  Button,
  withStyles,
  Typography
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import DriveHelper from "../../helpers/driveHelper";
import TallyMark from "../../objects/tallies/tallyMark";
import TallyMarkChip from "../../views/tallyMark/tallyMarkChip";
import AddTally from "./addTally";
import EntryStyling from "./entryStyling";
import {
  Save,
  ArrowBack,
  ArrowForward,
  ThumbDownOutlined,
  ThumbDown,
  ThumbUpOutlined,
  ThumbUp
} from "@material-ui/icons";
import ReactGA from "react-ga";

const styles = EntryStyling.styles;

class Entry extends Component {
  constructor(props) {
    super(props);

    if (this.props.adding) {
      const dateObject = new Date();
      const formattedMonth = this.formatMonth(dateObject.getMonth());
      const formattedDate = this.formatDate(dateObject.getDate());
      this.state = {
        customTitle: "",
        date:
          dateObject.getFullYear() + "-" + formattedMonth + "-" + formattedDate,
        dateOfBirth: this.props.userStore.preferences.dateOfBirth,
        bodyText: "",
        tallies: [],
        isThumbUp: false, // Thumb indicates mood, can be up or down or neither
        isThumbDown: false,
        entryNumber: this.props.diaryEntryStore.entries.length + 1,
        redirectIndex: 0
      };
    } else {
      const fullDate = new Date(this.props.date);
      const month = this.formatMonth(fullDate.getMonth());
      const year = fullDate.getFullYear();
      const date = this.formatDate(fullDate.getDate());
      const dateString = year + "-" + month + "-" + date;
      this.state = {
        customTitle: this.props.title,
        date: dateString,
        dateOfBirth: this.props.userStore.preferences.dateOfBirth,
        bodyText: this.props.bodyText,
        tallies: this.props.tallies,
        isThumbUp: this.props.isThumbUp,
        isThumbDown: this.props.isThumbDown,
        index: this.props.index,
        entryNumber: this.props.entryNumber,
        redirectIndex: 0
      };
    }

    this.closeSuccessSnackBar = this.closeSuccessSnackBar.bind(this);
    this.addNewEntry = this.addNewEntry.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.addNewTallyMark = this.addNewTallyMark.bind(this);
    this.deleteTallyMark = this.deleteTallyMark.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.navigateForward = this.navigateForward.bind(this);
    this.toggleThumbUp = this.toggleThumbUp.bind(this);
    this.toggleThumbDown = this.toggleThumbDown.bind(this);
    this.updateDateString = this.updateDateString.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.formatMonth = this.formatMonth.bind(this);
  }

  render() {
    const { classes } = this.props;
    const daysAlive =
      Math.round(
        (new Date(this.state.date) - new Date(this.state.dateOfBirth)) /
          (1000 * 60 * 60 * 24)
      ) + 1;
    return (
      <div>
        <Paper elevation={1} className={classes.paper}>
          {/* Title */}
          <div className={classes.customTitleWrapper}>
            <TextField
              label="Title"
              id="customTitle"
              name="customTitle"
              value={this.state.customTitle}
              onChange={this.handleInputChange}
              className={classes.customTitleInput}
              InputLabelProps={{
                style: { fontSize: "20px" }
              }}
              InputProps={{
                startAdornment: (
                  <div className={classes.customTitleAdornment}>
                    {"Day " + daysAlive}
                  </div>
                ),
                className: classes.customTitleInput
              }}
            />
          </div>

          {/* Top Cluster (Date Selector, Previous/Next Entry Buttons) */}
          <div className={classes.topCluster}>
            <TextField
              id="date"
              name="date"
              type="date"
              value={this.state.date}
              onChange={this.handleInputChange}
              InputLabelProps={{}}
            />
          </div>

          {this.props.adding ? null : (
            <div>
              <div className={classes.navButton}>
                <IconButton
                  className={classes.button}
                  aria-label="Next Entry"
                  disabled={
                    this.props.diaryEntryStore.entries.length - 1 <=
                    this.props.index
                  }
                  onClick={this.props.navigateForward}
                >
                  <ArrowForward />
                </IconButton>
              </div>
              <div className={classes.navButton}>
                <IconButton
                  className={classes.button}
                  aria-label="Previous Entry"
                  disabled={Number(this.props.index) === 0}
                  onClick={this.props.navigateBack}
                >
                  <ArrowBack />
                </IconButton>
              </div>
            </div>
          )}

          {/* Body Text */}
          <div className={classes.bodyTextWrapper}>
            <TextField
              name="bodyText"
              id="outlined-multiline-static"
              label="Your Thoughts"
              multiline
              rows="15"
              value={this.state.bodyText}
              onChange={this.handleInputChange}
              className={classes.bodyText}
              margin="normal"
              variant="outlined"
            />
          </div>

          {/* Bottom Cluster (Add Tallies, Thumbs) */}
          <div className={classes.bottomClusterGridContainer}>
            <Grid container>
              <Grid item className={classes.bottomClusterObject}>
                <AddTally
                  currentFileName={this.state.entryNumber}
                  tallyMarks={this.state.tallies}
                  diaryEntryStore={this.props.diaryEntryStore}
                  addNewTallyMark={this.addNewTallyMark}
                />
              </Grid>
              <Grid
                item
                className={classes.bottomClusterRightObject}
                style={{ marginLeft: "1em" }}
              >
                <IconButton
                  className={classes.button}
                  aria-label="Good Rating"
                  onClick={this.toggleThumbUp}
                >
                  {this.state.isThumbUp ? <ThumbUp /> : <ThumbUpOutlined />}
                </IconButton>
              </Grid>
              <Grid item className={classes.bottomClusterRightObject}>
                <IconButton
                  className={classes.button}
                  aria-label="Bad Rating"
                  onClick={this.toggleThumbDown}
                >
                  {this.state.isThumbDown ? (
                    <ThumbDown />
                  ) : (
                    <ThumbDownOutlined />
                  )}
                </IconButton>
              </Grid>
            </Grid>
          </div>

          {this.state.tallies.length > 0 ? (
            <div>
              <Divider className={classes.spaceDivider} />
              <Typography variant="h5" className={classes.chipHeader}>
                Tally Marks
              </Typography>
              <div>
                {this.state.tallies.map((currentValue, index) => {
                  return (
                    <TallyMarkChip
                      type={currentValue.type}
                      text={currentValue.text}
                      index={index}
                      deleteTallyMark={this.deleteTallyMark}
                    />
                  );
                })}
              </div>
              <Divider className={classes.spaceDivider} />
            </div>
          ) : (
            <div />
          )}

          {this.props.adding ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              className={classes.submitButton}
              onClick={this.addNewEntry}
            >
              Submit
              <Save className={classes.sendIcon} />
            </Button>
          ) : (
            <div>
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.backButton}
                onClick={this.props.back}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.submitButton}
                onClick={this.updateEntry}
              >
                Update
                <Save className={classes.sendIcon} />
              </Button>
            </div>
          )}
        </Paper>
        <Snackbar
          open={this.state.showSuccessfulSave}
          ContentProps={{
            "aria-describedby": "message-id"
          }}
          message={<span>Save Successful</span>}
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
      </div>
    );
  }

  /* Methods */

  toggleThumbUp() {
    const thumbUp = !this.state.isThumbUp;

    this.setState({
      isThumbUp: thumbUp,
      isThumbDown: false
    });
  }

  toggleThumbDown() {
    const thumbDown = !this.state.isThumbDown;
    this.setState({
      isThumbDown: thumbDown,
      isThumbUp: false
    });
  }

  navigateBack() {
    this.setState({
      shouldRedirect: true,
      redirectIndex: Number(this.props.index) - 1
    });
  }

  navigateForward() {
    this.setState({
      shouldRedirect: true,
      redirectIndex: Number(this.props.index) + 1
    });
  }

  closeSuccessSnackBar() {
    this.setState({ showSuccessfulSave: false });
  }

  addNewTallyMark(newTallyMarkType, newTallyMarkText) {
    this.setState(prevState => ({
      tallies: [
        ...prevState.tallies,
        new TallyMark(newTallyMarkType, newTallyMarkText)
      ]
    }));
  }

  deleteTallyMark(index) {
    const array = [...this.state.tallies];
    array.splice(index, 1);
    this.setState({ tallies: array });
  }

  addNewEntry(e) {
    e.preventDefault();

    ReactGA.event({
      category: "User",
      action: "Added Entry - Web"
    });

    if (this.state.date) {
      const parsedDate = this.updateDateString(this.state.date);

      // Updates Diary Entry Store global state with new entry
      this.props.diaryEntryStore.entries.push({
        title: this.state.customTitle,
        date: parsedDate,
        bodyText: this.state.bodyText,
        tallies: this.state.tallies,
        isThumbUp: this.state.isThumbUp,
        isThumbDown: this.state.isThumbDown,
        entryNumber: this.state.entryNumber
      });

      // Updates Google Drive with New Entry
      DriveHelper.updateEntries(this.props.diaryEntryStore.entries);

      // Reset Diary Entry
      const dateObject = new Date();
      const formattedMonth =
        (dateObject.getMonth() + 1).toString().length === 1
          ? "0" + (dateObject.getMonth() + 1)
          : dateObject.getMonth() + 1;
      const dateNumber = dateObject.getDate();
      const formattedDate = dateNumber / 10 < 1 ? "0" + dateNumber : dateNumber;

      this.setState({
        showSuccessfulSave: false
      });

      this.setState({
        customTitle: "",
        date:
          dateObject.getFullYear() + "-" + formattedMonth + "-" + formattedDate,
        bodyText: "",
        tallies: [],
        isThumbUp: false,
        isThumbDown: false,
        newTallyMarkType: TallyMark.tallyTypeEnum.FOOD,
        newTallyMarkText: "",
        entryNumber: this.props.diaryEntryStore.entries.length + 1,
        showSuccessfulSave: true
      });

      const copy = this.props.diaryEntryStore.entries.splice(0);
      copy.sort((a, b) => {
        // Sorts diaries in descending order by date
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      this.props.diaryEntryStore.entries = copy;
    } else {
      console.log("Error Posting Entry: Invalid Date");
    }
  }

  updateEntry(e) {
    e.preventDefault();

    ReactGA.event({
      category: "User",
      action: "Updated Entry - Web"
    });

    const parsedDate = this.updateDateString(this.state.date);

    // Updates Diary Entry Store global state with updated entry
    this.props.diaryEntryStore.entries[this.props.index] = {
      title: this.state.customTitle,
      date: parsedDate,
      bodyText: this.state.bodyText,
      tallies: this.state.tallies,
      isThumbUp: this.state.isThumbUp,
      isThumbDown: this.state.isThumbDown,
      entryNumber: this.props.entryNumber
    };

    // Updates Google Drive with updated entry
    DriveHelper.updateEntries(this.props.diaryEntryStore.entries);

    // Post update tasks
    this.setState({
      showSuccessfulSave: false
    });

    this.setState({
      showSuccessfulSave: true
    });

    const copy = this.props.diaryEntryStore.entries.splice(0);
    copy.sort((a, b) => {
      // Sorts diaries in descending order by date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    this.props.diaryEntryStore.entries = copy;
  }

  updateDateString(dateInput) {
    const dateArray = dateInput.split("-");
    const year = dateArray[0];
    const month = dateArray[1];
    let date = dateArray[2];
    date = parseInt(date) + 1;
    const formattedDate = this.formatDate(date);
    return year + "-" + month + "-" + formattedDate;
  }

  formatDate(dateNumber) {
    const date = parseInt(dateNumber) / 10 < 1 ? "0" + dateNumber : dateNumber;
    return date;
  }

  formatMonth(monthInput) {
    const monthNumber = parseInt(monthInput);
    const month =
      (monthNumber + 1).toString().length === 1
        ? "0" + (monthNumber + 1)
        : monthNumber + 1;
    return month;
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
}

Entry.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Entry);
