import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import TallyMark from '../../objects/tallies/tallyMark';
import TalliesView from '../../views/tallies/talliesView';

class AddTally extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      newTallyMarkType: "",
      newTallyMarkTypeError: false,
      newTallyMarkText: "",
      newTallyMarkTextError: false,
    };
    this.handleTypeChange = this.handleTypeChange.bind(this);
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
    if(this.state.newTallyMarkText === '' || this.state.newTallyMarkText[0] === ' ') {
      this.setState({newTallyMarkTextError: true});
    } else {
      if(this.state.newTallyMarkType === '') {
        this.setState({newTallyMarkTypeError: true});
      } else {
        this.props.addNewTallyMark(this.state.newTallyMarkType, this.state.newTallyMarkText);
        this.setState({
          newTallyMarkType: "",
          newTallyMarkTypeError: false,
          newTallyMarkText: "",
          newTallyMarkTextError: false,
        })
      }
    }    
  }

  handleTypeChange(event) {
    const value = event.target.value;
      this.setState({
        newTallyMarkTypeError: (value === ""),
        newTallyMarkType: value, 
      });
  }

  handleTextChange(event) {
    const value = event.target.value;
    this.setState({
      newTallyMarkTextError: (value === '' || value[0] === ' '),
      newTallyMarkText: value
    })
  }

  render() {
    const { fullScreen } = this.props;
    return (
      <div>
        <Button variant="contained" color="primary" onClick={this.handleClickOpen} 
          style={{fontSize: '.8em'}}>
        Tallies
        </Button>
        <Dialog
          fullScreen={fullScreen}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{"Tallies"}</DialogTitle>
          <DialogContent>
            <TalliesView currentFileName={this.props.currentFileName} currentEntryTallyMarks={this.props.tallyMarks} 
              diaryEntryStore={this.props.diaryEntryStore} />
            <FormControl className="tallyFormControl">
              {this.state.newTallyMarkTypeError ? 
                <div>
                  <InputLabel htmlFor="age-auto-width">Category</InputLabel>
                  <Select
                      name="newTallyMarkType"
                      value={this.state.newTallyMarkType}
                      onChange={this.handleTypeChange}
                      inputProps={{
                          name: 'newTallyMarkType',
                          id: 'newTallyMarkType',
                      }}
                      style={{
                        width: 175,
                      }}
                      error
                  >
                      <MenuItem value=""><em>Select</em></MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.FOOD}>Food</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.ACTIVITY}>Activity</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.LOCATION}>Location</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.PERSON}>Person</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.OTHER}>Other</MenuItem>
                  </Select>
                  <FormHelperText>Please Select A Category</FormHelperText>
                </div> :
                <div>
                  <InputLabel htmlFor="age-auto-width">Category</InputLabel>
                  <Select
                      name="newTallyMarkType"
                      value={this.state.newTallyMarkType}
                      onChange={this.handleTypeChange}
                      inputProps={{
                          name: 'newTallyMarkType',
                          id: 'newTallyMarkType',
                      }}
                      style={{
                        width: 175,
                      }}
                  >
                      <MenuItem value=""><em>Select</em></MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.FOOD}>Food</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.ACTIVITY}>Activity</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.LOCATION}>Location</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.PERSON}>Person</MenuItem>
                      <MenuItem value={TallyMark.tallyTypeEnum.OTHER}>Other</MenuItem>
                  </Select>
                </div>
            }
            {this.state.newTallyMarkTextError ? 
              <div>
                <TextField
                  label="Tally Mark Label"
                  id="newTallyMarkText"
                  name="newTallyMarkText"
                  onChange = {this.handleTextChange}
                  value={this.state.newTallyMarkText}
                  error
                  style={{
                    width: 175,
                  }}
                />
                <FormHelperText>Please Enter A Valid Label</FormHelperText> 
              </div> : 
              <div>
               <TextField
                 label="Tally Mark Label"
                 id="newTallyMarkText"
                 name="newTallyMarkText"
                 onChange = {this.handleTextChange}
                 value={this.state.newTallyMarkText}
                 style={{
                  width: 175,
                 }}
               />
             </div>
            }
            <Button onClick={this.handleSubmit} color="primary" autoFocus>
              Add
            </Button>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AddTally.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
};

export default withMobileDialog()(AddTally);