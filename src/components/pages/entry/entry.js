import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {TextField, IconButton, Snackbar, Divider, Grid, Paper, Button, withStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DriveHelper from '../../helpers/driveHelper';
import Todo from '../../objects/todos/todo'; 
import TodoChip from '../../views/todo/todoChip';
import TallyMark from '../../objects/tallies/tallyMark';
import TallyMarkChip from '../../views/tallyMark/tallyMarkChip';
import AddTally from './addTally';
import AddTodo from './addTodo';
import EntryStyling from './entryStyling';
import {Save, ArrowBack, ArrowForward, ThumbDownOutlined, ThumbDown, ThumbUpOutlined, ThumbUp} from '@material-ui/icons';

const styles = EntryStyling.styles;

class Entry extends Component {
    constructor(props) {
        super(props);

        if(this.props.adding) {
            const dateObject = new Date();
            const formattedMonth = (dateObject.getMonth() + 1).toString().length === 1 ? "0" + ( dateObject.getMonth() + 1 ) : dateObject.getMonth() + 1;
            const dateNumber = dateObject.getDate();
            const formattedDate = dateNumber / 10 < 1 ? "0" + dateNumber : dateNumber;
            this.state = {
                customTitle: '',
                date: dateObject.getFullYear() + "-" + formattedMonth + "-" + formattedDate,
                dateOfBirth: this.props.userStore.preferences.dateOfBirth,
                bodyText: '',
                tallies: [],
                todos: [],
                isThumbUp: false, // Thumb indicates mood, can be up or down or neither
                isThumbDown: false,
                entryNumber: this.props.diaryEntryStore.entries.length + 1,
                redirectIndex: 0,
            };
        } else {
            this.state = {
                customTitle: this.props.title,
                date: this.props.date,
                dateOfBirth: this.props.userStore.preferences.dateOfBirth,
                bodyText: this.props.bodyText,
                tallies: this.props.tallies,
                todos: this.props.todos,
                isThumbUp: this.props.isThumbUp,
                isThumbDown: this.props.isThumbDown,
                index: this.props.index,
                entryNumber: this.props.entryNumber,
                redirectIndex: 0,
            };
        }

        this.closeSuccessSnackBar = this.closeSuccessSnackBar.bind(this);
        this.addNewEntry = this.addNewEntry.bind(this);
        this.updateEntry = this.updateEntry.bind(this);
        this.addNewTallyMark = this.addNewTallyMark.bind(this);
        this.deleteTallyMark = this.deleteTallyMark.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.navigateBack = this.navigateBack.bind(this);
        this.navigateForward = this.navigateForward.bind(this);
        this.toggleThumbUp = this.toggleThumbUp.bind(this);
        this.toggleThumbDown = this.toggleThumbDown.bind(this);
    }

    render() {
        const { classes } = this.props;
        const daysAlive = Math.round((new Date(this.state.date) - new Date(this.state.dateOfBirth)) / (1000 * 60 * 60 * 24));
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
                            style: {fontSize:"20px"},
                        }}
                        InputProps={{
                            startAdornment: <div className={classes.customTitleAdornment}>{"Day " + daysAlive}</div>,
                            className: classes.customTitleInput
                        }}
                    />
                </div>

                {/* Top Cluster (Date Selector, Add Tally Button, Add Todo Button) */}
                <div className={classes.topCluster}>
                    <TextField
                        id="date"
                        name="date"
                        type="date"
                        value={this.state.date}
                        onChange={this.handleInputChange}
                        InputLabelProps={{
                        }}
                    /> 
                </div>

                {this.props.adding ? null :
                    <div> 
                        <div className={classes.navButton}> 
                            <IconButton className={classes.button} aria-label="Next Entry"
                                        disabled={this.props.diaryEntryStore.entries.length - 1 <= this.props.index}
                                        onClick={this.props.navigateForward}>
                                <ArrowForward/>
                            </IconButton>
                        </div>
                        <div className={classes.navButton}> 
                            <IconButton className={classes.button} aria-label="Previous Entry" 
                                        disabled={Number(this.props.index) === 0}
                                        onClick={this.props.navigateBack}>
                                <ArrowBack/>
                            </IconButton>
                        </div>
                    </div>
                }

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
                
                {/* Bottom Cluster (Mood and Weather) */}
                <div className={classes.bottomClusterGridContainer}>
                    <Grid container>
                        <Grid item className={classes.bottomClusterObject}>
                            <AddTally currentFileName={this.state.entryNumber} tallyMarks={this.state.tallies} 
                                      diaryEntryStore={this.props.diaryEntryStore} addNewTallyMark={this.addNewTallyMark}/>
                        </Grid>
                        <Grid item className={classes.bottomClusterObject}>
                            <AddTodo addTodo={this.addTodo}/>
                        </Grid>
                        <Grid item className={classes.bottomClusterRightObject} style={{marginLeft: '1em'}}>
                            <IconButton className={classes.button} aria-label="Good Rating" 
                                        onClick={this.toggleThumbUp}>
                                {this.state.isThumbUp ? <ThumbUp /> : <ThumbUpOutlined/>}
                            </IconButton>
                        </Grid>
                        <Grid item className={classes.bottomClusterRightObject}>
                            <IconButton className={classes.button} aria-label="Bad Rating" 
                                        onClick={this.toggleThumbDown}>
                                {this.state.isThumbDown ? <ThumbDown /> : <ThumbDownOutlined/>}
                            </IconButton>
                        </Grid>
                    </Grid>
                </div>

                <Divider className={classes.spaceDivider}/>
                    <h2 className={classes.chipHeader}>Tally Marks</h2>
                    {
                        this.state.tallies.length === 0 ? <i className={classes.noChipText}>There are no tallies to show</i> :
                        <div>{this.state.tallies.map((currentValue, index)=> 
                            {return <TallyMarkChip type={currentValue.type} text={currentValue.text} index={index} deleteTallyMark={this.deleteTallyMark}/>})}
                        </div> 
                    }

                <Divider className={classes.spaceDivider}/>
                    <h2 className={classes.chipHeader}>Todos</h2>
                    {
                        this.state.todos.length === 0 ? <i className={classes.noChipText}>There are no todos to show</i> :
                        <div>{this.state.todos.map((currentValue, index)=> 
                            {return <TodoChip status={currentValue.status} text={currentValue.text} index={index} deleteTodo={this.deleteTodo}/>})}
                        </div> 
                    }
                
                <Divider className={classes.spaceDivider}/>

                {this.props.adding ? 
                    <Button variant="contained" color="primary" size="large" className={classes.submitButton} onClick={this.addNewEntry}>
                        Submit
                        <Save className={classes.sendIcon}/>
                    </Button> :
                    <div>
                    <Button variant="contained" color="primary" size="large" className={classes.backButton} onClick={this.props.back}>
                        Back
                    </Button>
                    <Button variant="contained" color="primary" size="large" className={classes.submitButton} onClick={this.updateEntry}>
                        Update
                        <Save className={classes.sendIcon}/>
                    </Button>
                    </div>
                }
            </Paper>
            <Snackbar
                open={this.state.showSuccessfulSave}
                ContentProps={{
                    'aria-describedby': 'message-id',
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
            isThumbDown: false,
        })
    }

    toggleThumbDown() {
        const thumbDown = !this.state.isThumbDown;
        this.setState({
            isThumbDown: thumbDown,
            isThumbUp: false,
        })
    }

    navigateBack() {
        this.setState({
            shouldRedirect: true,
            redirectIndex: Number(this.props.index) - 1,
        })
    }
    
    navigateForward() {
        this.setState({
            shouldRedirect: true,
            redirectIndex: Number(this.props.index) + 1,
        })
    }

    closeSuccessSnackBar() {
        this.setState({showSuccessfulSave: false}); 
    }

    addNewTallyMark(newTallyMarkType, newTallyMarkText) {
        this.setState(prevState => ({
            tallies: [...prevState.tallies, new TallyMark(newTallyMarkType, newTallyMarkText)]
          }))
    }

    deleteTallyMark(index) {
        const array = [...this.state.tallies]; 
        array.splice(index, 1);
        this.setState({tallies: array});
    }

    addTodo(newTodoStatus, newTodoText) {
        this.setState(prevState => ({
            todos: [...prevState.todos, new Todo(newTodoStatus, newTodoText)]
          }))
    }

    deleteTodo(index) {
        const array = [...this.state.todos]; 
        array.splice(index, 1);
        this.setState({todos: array});
    }

    addNewEntry(e) {
        e.preventDefault();

        if(this.state.date) {
            // Updates Diary Entry Store global state with new entry
            this.props.diaryEntryStore.entries.push({
                "title": this.state.customTitle, 
                "date": this.state.date,
                "bodyText": this.state.bodyText,
                "tallies": this.state.tallies,  
                "todos": this.state.todos,
                "isThumbUp": this.state.isThumbUp, 
                "isThumbDown": this.state.isThumbDown,
                "entryNumber": this.state.entryNumber,
            });

            // Updates Google Drive with New Entry
            DriveHelper.updateEntries(this.props.diaryEntryStore.entries); 

            // Reset Diary Entry
            const dateObject = new Date();
            const formattedMonth = (dateObject.getMonth() + 1).toString().length === 1 ? "0" + ( dateObject.getMonth() + 1 ) : dateObject.getMonth() + 1;
            const dateNumber = dateObject.getDate();
            const formattedDate = dateNumber / 10 < 1 ? "0" + dateNumber : dateNumber;
            
            this.setState({
                showSuccessfulSave: false,
            })
            
            this.setState({
                customTitle: '',
                date: dateObject.getFullYear() + "-" + formattedMonth + "-" + formattedDate,
                bodyText: '',
                tallies: [],
                todos: [],
                isThumbUp: false,
                isThumbDown: false,
                newTallyMarkType: TallyMark.tallyTypeEnum.FOOD,
                newTallyMarkText: '',
                newTodoStatus: false,
                newTodoText: '',
                entryNumber: this.props.diaryEntryStore.entries.length + 1,
                showSuccessfulSave: true,
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

        // Updates Diary Entry Store global state with updated entry
        this.props.diaryEntryStore.entries[this.props.index] = {
            "title": this.state.customTitle, 
            "date": this.state.date,
            "bodyText": this.state.bodyText,
            "tallies": this.state.tallies, 
            "todos": this.state.todos,
            "isThumbUp": this.state.isThumbUp, 
            "isThumbDown": this.state.isThumbDown,
            "entryNumber": this.props.entryNumber,
        };

        // Updates Google Drive with updated entry
        DriveHelper.updateEntries(this.props.diaryEntryStore.entries); 

        // Post update tasks
        this.setState({
            showSuccessfulSave: false,
        });

        this.setState({
            showSuccessfulSave: true,
        });

        const copy = this.props.diaryEntryStore.entries.splice(0);
        copy.sort((a, b) => {
            // Sorts diaries in descending order by date
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        this.props.diaryEntryStore.entries = copy;
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
          [name]: value
        });
    }
}

Entry.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Entry)
