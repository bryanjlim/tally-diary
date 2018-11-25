import React from 'react';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

class PasswordUnlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      password: '',
      incorrectPassword: false,
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  checkPassword = () => {
    if (this.props.userStore.preferences.password === this.state.password) {
      this.props.onPasswordChecked();
    } else {
      this.setState({ incorrectPassword: true });
    }
  }

  onKeyPress(event) {
    if (event.key === 'Enter') {
        this.checkPassword();
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
    const { classes } = this.props;

    return (
      <div>
        <Dialog
          open={this.state.open}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Enter Password</DialogTitle>
          <DialogContent>
            <TextField
                name="password"
                label="Password"
                type="password"
                error={this.state.incorrectPassword}
                value={this.state.password}
                onChange={this.handleInputChange}
                onKeyPress={this.onKeyPress}
                className={classes.input}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.checkPassword} color="primary">
              Enter
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const styles = theme => ({
  input: {
    '@media (max-width: 350px)': { 
      marginLeft: '-1em',
  },
  }
});

PasswordUnlock.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PasswordUnlock)