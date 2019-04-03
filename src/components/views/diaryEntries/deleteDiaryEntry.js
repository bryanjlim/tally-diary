import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography'
import DialogTitle from '@material-ui/core/DialogTitle';

class DeleteDiaryEntry extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    }
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
}


  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleDelete = () => {
    this.props.handleDelete();
  }

  render() {
    return (
      <div>
        <MenuItem onClick={this.handleClickOpen}>Delete</MenuItem>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
        >
          <DialogTitle >{"Confirmation Prompt"}</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this entry? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleDelete} color="secondary">
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default DeleteDiaryEntry;