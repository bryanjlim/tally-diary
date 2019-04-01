import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch'
import { Typography } from '@material-ui/core';

class AddFilters extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      startDate: null,
      endDate: null,
      bodyTextContains: "",
      containsTodo: "",
      containsTally: "",
      restrictToGoodDays: false,
      restrictToBadDays: false,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleGoodDaysSwitch = this.toggleGoodDaysSwitch.bind(this);
    this.toggleBadDaysSwitch = this.toggleBadDaysSwitch.bind(this);
  }


  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit() {
    this.props.filter(this.state.startDate, this.state.endDate, this.state.bodyTextContains,
      this.state.containsTodo, this.state.containsTally, this.state.restrictToGoodDays, this.state.restrictToBadDays);
    this.setState({
      open: false,
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

  toggleGoodDaysSwitch() {
    const currentStatus = this.state.restrictToGoodDays;

    if(!currentStatus) {
      this.setState({
        restrictToGoodDays: true,
        restrictToBadDays: false,
      })
    } else {
      this.setState({
        restrictToGoodDays: false,
        restrictToBadDays: false,
      })
    }
  }

  toggleBadDaysSwitch() {
    const currentStatus = this.state.restrictToBadDays;

    if(!currentStatus) {
      this.setState({
        restrictToBadDays: true,
        restrictToGoodDays: false,
        
      })
    } else {
      this.setState({
        restrictToBadDays: false,
        restrictToGoodDays: false,
      })
    }
  }

  render() {

    return (
      <div>
        <Button variant="contained" color="primary" onClick={this.handleClickOpen}
          style={{ fontSize: '.8em' }}>
          Filter Cards
        </Button>
        <Dialog
          fullScreen={false}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{"Filter Diary Entries"}</DialogTitle>
          <DialogContent style={{
            width: '300px',
          }}>
            <FormControl>
              <TextField
                label="Start Date"
                id="startDate"
                name="startDate"
                type="date"
                value={this.state.startDate}
                onChange={this.handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                style={{ marginBottom: '1em', }}
              />
              <TextField
                label="End Date"
                id="endDate"
                name="endDate"
                type="date"
                value={this.state.endDate}
                onChange={this.handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                label="Body Text Contains..."
                id="bodyTextContains"
                name="bodyTextContains"
                onChange={this.handleInputChange}
                value={this.state.bodyTextContains}
                margin="normal"
                variant="outlined"
              />
              <TextField
                label="Contains Todo..."
                id="containsTodo"
                name="containsTodo"
                onChange={this.handleInputChange}
                value={this.state.containsTodo}
                margin="normal"
                variant="outlined"
              />
              <TextField
                label="Contains Tally..."
                id="containsTally"
                name="containsTally"
                onChange={this.handleInputChange}
                value={this.state.containsTally}
                margin="normal"
                variant="outlined"
              />
              <Typography>Restrict to Good Days</Typography>
              <Switch
                checked={this.state.restrictToGoodDays}
                onChange={this.toggleGoodDaysSwitch}
                value={this.state.restrictToGoodDays}
              />
              <Typography>Restrict to Bad Days</Typography>
              <Switch
                checked={this.state.restrictToBadDays}
                onChange={this.toggleBadDaysSwitch}
                value={this.state.restrictToBadDays}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              Cancel
            </Button>
            <Button onClick={this.handleSubmit} color="primary" autoFocus>
              Set Filters
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AddFilters.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
};

export default withMobileDialog()(AddFilters);