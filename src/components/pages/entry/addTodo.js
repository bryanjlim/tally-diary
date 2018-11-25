import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';

class AddTodo extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      newTodoStatus: false,
      newTodoText: "",
      newTodoTextError: false,
    };
    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
}


  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = () => {
    if(this.state.newTodoText === '' || this.state.newTodoText[0] === ' ') {
      this.setState({newTodoTextError: true});
    } else {
        this.props.addTodo(this.state.newTodoStatus, this.state.newTodoText);
        this.setState({
          open: false,
          newTodoStatus: false,
          newTodoText: "",
          newTodoTextError: false,
        })
      }
  }

  handleStatusChange = event => {
    this.setState({ newTodoStatus: event.target.checked });
  };

  handleTextChange(event) {
    const value = event.target.value;
    this.setState({
      newTodoTextError: (value === '' || value[0] === ' '),
      newTodoText: value
    })
  }

  render() {

    return (
      <div>
        <Button variant="contained" color="primary" onClick={this.handleClickOpen} 
          style={{fontSize: '.8em'}}>
        Add Todo
        </Button>
        <Dialog
          fullScreen={false}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{"Add Todo"}</DialogTitle>
          <DialogContent style={{
            width: '300px',
          }}>
            <FormControl 
              className="todoFormControl" 
              style={{
                position:"absolute", 
                left:3,
                marginTop: 20,
              }}
            >
              <Checkbox
                checked={this.state.newTodoStatus}
                onChange={this.handleStatusChange}
                value="this.state.newTodoStatus"
                style={{
                  display: "inline-block",
                }}
              />
            </FormControl>
            
            <FormControl
              style={{
                paddingLeft: 50,
                paddingRight: 30,
              }}
            >
            {this.state.newTodoTextError ? 
              <div>
                <TextField
                  label="New Todo"
                  id="newTodoText"
                  name="newTodoText"
                  onChange = {this.handleTextChange}
                  value={this.state.newTodoText}
                  error
                  style={{
                    width: 160,
                    marginLeft: '-1em',
                    display: "inline-block",
                  }}
                  margin="normal"
                  variant="outlined"
                />
                <FormHelperText>Please Enter A Valid Todo</FormHelperText> 
              </div> : 
              <div>
              <TextField
                label="New Todo"
                id="newTodoText"
                name="newTodoText"
                onChange = {this.handleTextChange}
                value={this.state.newTodoText}
                style={{
                  width: 160,
                  marginLeft: '-1em',
                  display: "inline-block",
                }}
                margin="normal"
                variant="outlined"
              />
            </div>
            }
            </FormControl> 
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              Cancel
            </Button>
            <Button onClick={this.handleSubmit} color="primary" autoFocus>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AddTodo.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
};

export default withMobileDialog()(AddTodo);