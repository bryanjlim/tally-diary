import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

class DeleteAllFiles extends React.Component {

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
    this.props.deleteAllFiles();
  }

  render() {
    return (
      <div>
        <Button color="secondary" onClick={this.handleClickOpen}>Delete All Files</Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
        >
          <DialogTitle >{"Confirmation Prompt"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
                This will delete all your files, including all diary entries and your settings. This cannot be undone. Do you wish to proceed?
            </DialogContentText>
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

export default DeleteAllFiles;