import React from 'react';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

class PinUnlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      pin: '',
      incorrectPin: false,
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.checkPin = this.checkPin.bind(this);
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  checkPin = () => {
    if (this.props.userStore.preferences.pin == this.state.pin) {
      this.props.onPinChecked();
    } else {
      this.setState({ incorrectPin: true });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    
    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div>
        <Dialog
          open={this.state.open}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Enter Pin</DialogTitle>
          <DialogContent>
            <TextField
                name="pin"
                label="Pin"
                type="password"
                error={this.state.incorrectPin}
                value={this.state.pin}
                onChange={this.handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.checkPin} color="primary">
              Enter
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const styles = theme => ({
});

PinUnlock.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PinUnlock)