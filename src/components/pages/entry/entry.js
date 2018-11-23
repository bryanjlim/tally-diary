import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {TextField, IconButton, Snackbar, MenuItem, Divider, Grid, Paper, Button, withStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import DriveHelper from '../../helpers/driveHelper';
import Mood from '../../objects/mood/mood'; 
import Weather from '../../objects/weather/weather'; 
import Todo from '../../objects/todos/todo'; 
import TodoChip from '../../views/todo/todoChip';
import TallyMark from '../../objects/tallies/tallyMark';
import TallyMarkChip from '../../views/tallyMark/tallyMarkChip';
import AddTally from './addTally';
import AddTodo from './addTodo';
import EntryStyling from './entryStyling';
import Save from '@material-ui/icons/Save';

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
                mood: Mood.moodEnum.MEH,
                weather: null,
                lowTemperature: null,
                highTemperature: null, 
                humidity: null,
                tallies: [],
                todos: [],
                fileName: this.props.diaryEntryStore.entries.length + 1,
                showSuccessfulSave: false,
            };
        } else {
            const weatherObject = this.props.weather;

            this.state = {
                customTitle: this.props.title,
                date: this.props.date,
                dateOfBirth: this.props.userStore.preferences.dateOfBirth,
                bodyText: this.props.bodyText,
                mood: Mood.moodEnum.MEH,
                weather: weatherObject.weather,
                lowTemperature: weatherObject.lowTemperature,
                highTemperature: weatherObject.highTemperature, 
                humidity: weatherObject.humidity,
                tallies: this.props.tallies,
                todos: this.props.todos,
                index: this.props.index,
                fileName: this.props.fileName,
                showSuccessfulSave: false,
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
                    <div className={classes.verticalButtonCluster}> 
                        <br/>
                        <div className={classes.addButton}><AddTally currentFileName={this.state.fileName} tallyMarks={this.state.tallies} diaryEntryStore={this.props.diaryEntryStore} addNewTallyMark={this.addNewTallyMark}/></div> 
                        <br/>
                        <div className={classes.addButton}><AddTodo addTodo={this.addTodo}/></div>
                    </div>
                </div>
                <div className={classes.horizontalButtonCluster}> 
                        <div className={classes.addButton}><AddTally currentFileName={this.state.fileName} tallyMarks={this.state.tallies} diaryEntryStore={this.props.diaryEntryStore} addNewTallyMark={this.addNewTallyMark}/></div>
                        <div className={classes.addButton}><AddTodo addTodo={this.addTodo}/></div>
                </div>

                {/* Body Text */}
                <div className={classes.bodyTextWrapper}>
                    <TextField
                        name="bodyText"
                        id="outlined-multiline-static"
                        label="Your Thoughts"
                        multiline
                        rows="10"
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
                        <Grid item className={classes.moodSelector}>
                            <TextField
                                label="Mood"
                                name="mood"
                                value={this.state.mood}
                                onChange={this.handleInputChange}
                                variant="outlined"
                                select
                            >
                                <MenuItem key={Mood.moodEnum.MEH} value={Mood.moodEnum.MEH}><span role="img" aria-label="meh">😐</span></MenuItem>
                                <MenuItem key={Mood.moodEnum.SAD} value={Mood.moodEnum.SAD}><span role="img" aria-label="happy">😃</span></MenuItem>
                                <MenuItem key={Mood.moodEnum.HAPPY} value={Mood.moodEnum.HAPPY}><span role="img" aria-label="sad">😔</span></MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item className={classes.bottomClusterObject}>
                            <TextField
                                label="Weather"
                                name="weather"
                                value={this.state.weather}
                                onChange={this.handleInputChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item className={classes.bottomClusterObject}>
                            <TextField
                                label="Low Temperature"
                                name="lowTemperature"
                                type="number"
                                value={this.state.lowTemperature}
                                onChange={this.handleInputChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item className={classes.bottomClusterObject}>
                            <TextField
                                label="High Temperature"
                                name="highTemperature"
                                type="number"
                                value={this.state.highTemperature}
                                onChange={this.handleInputChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item className={classes.bottomClusterObject}>
                            <TextField
                                label="Humidity"
                                name="humidity"
                                type="number"
                                value={this.state.humidity}
                                onChange={this.humidity}
                                variant="outlined"
                            />
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
            DriveHelper.postEntry({
                "title": this.state.customTitle, 
                "date": this.state.date,
                "bodyText": this.state.bodyText,
                "tallies": this.state.tallies, 
                "weather": new Weather(this.state.weather, this.state.lowTemperature, this.state.highTemperature, this.state.humidity), 
                "todos": this.state.todos,
                "mood": new Mood(this.state.mood),
                "deleted": false,
            }, this.state.fileName);
            this.props.diaryEntryStore.entries.push({
                "title": this.state.customTitle, 
                "date": this.state.date,
                "bodyText": this.state.bodyText,
                "tallies": this.state.tallies, 
                "weather": new Weather(this.state.weather, this.state.lowTemperature, this.state.highTemperature, this.state.humidity), 
                "todos": this.state.todos,
                "mood": new Mood(this.state.mood),
                "deleted": false,
                "fileName": this.state.fileName,
            });
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
                mood: Mood.moodEnum.MEH,
                weather: null,
                lowTemperature: null,
                highTemperature: null, 
                humidity: null,
                tallies: [],
                todos: [],
                newTallyMarkType: TallyMark.tallyTypeEnum.FOOD,
                newTallyMarkText: '',
                newTodoStatus: false,
                newTodoText: '',
                fileName: this.props.diaryEntryStore.entries.length + 1,
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
        DriveHelper.updateFile(this.props.fileName,
        {
            "title": this.state.customTitle, 
            "date": this.state.date,
            "bodyText": this.state.bodyText,
            "tallies": this.state.tallies, 
            "weather": new Weather(this.state.weather, this.state.lowTemperature, this.state.highTemperature, this.state.humidity), 
            "todos": this.state.todos,
            "mood": new Mood(this.state.mood)
        });
        this.props.diaryEntryStore.entries[this.props.index] = {
            "title": this.state.customTitle, 
            "date": this.state.date,
            "bodyText": this.state.bodyText,
            "tallies": this.state.tallies, 
            "weather": new Weather(this.state.weather, this.state.lowTemperature, this.state.highTemperature, this.state.humidity), 
            "todos": this.state.todos,
            "mood": new Mood(this.state.mood),
            "fileName": this.props.fileName,
        };

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
