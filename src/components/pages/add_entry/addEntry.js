import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {TextField, MenuItem, Divider, Grid, Paper, Button, withStyles } from '@material-ui/core';
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
import Send from '@material-ui/icons/Send'

const styles = EntryStyling.styles;

class Entry extends Component {
    constructor(props) {
        super(props);
        const formattedMonth = (new Date().getMonth() + 1).toString().length === 1 ? "0" + ( new Date().getMonth() + 1 ) : new Date().getMonth() + 1;
        this.state = {
            // New Diary Entry
            customTitle: '',
            date: new Date().getFullYear() + "-" + formattedMonth + "-" + new Date().getDate(),
            dateOfBirth: this.props.store.preferences.dateOfBirth,
            bodyText: '',
            mood: Mood.moodEnum.MEH,
            weather: 'Cloudy',
            lowTemperature: 60,
            highTemperature: 80, 
            humidity: 34,
            tallies: [],
            todos: [],
        };
        this.addNewEntry = this.addNewEntry.bind(this);
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
            <Paper elevation={1} className={classes.paper}>

                {/* Title */}
                <div className={classes.customTitleWrapper}>
                    <TextField
                        label="Title"
                        id="customTitle"
                        name="customTitle"
                        className={classes.customTitleInput}
                        InputLabelProps={{
                            style: {fontSize:"20px"},
                        }}
                        InputProps={{
                            startAdornment: <div className={classes.customTitleAdornment}>{"Day " + daysAlive}</div>,
                            style: {fontSize:"2em"},
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
                            shrink: true,
                        }}
                    /> 
                    <div className={classes.hideWhenSmall}> 
                        <br/>
                        <div className={classes.addButton}><AddTally addNewTallyMark={this.addNewTallyMark}/></div> 
                        <br/>
                        <div className={classes.addButton}><AddTodo addTodo={this.addTodo}/></div>
                    </div>
                </div>
                <div className={classes.hideWhenBig}> 
                        <div className={classes.addButton}><AddTally addNewTallyMark={this.addNewTallyMark}/></div>
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
                        <Grid item className={classes.bottomClusterObject}>
                            <TextField
                                label="Mood"
                                name="mood"
                                value={this.state.mood}
                                onChange={this.handleInputChange}
                                variant="outlined"
                                select
                            >
                                <MenuItem key={Mood.moodEnum.MEH} value={Mood.moodEnum.MEH}>😐</MenuItem>
                                <MenuItem key={Mood.moodEnum.SAD} value={Mood.moodEnum.SAD}>😃</MenuItem>
                                <MenuItem key={Mood.moodEnum.HAPPY} value={Mood.moodEnum.HAPPY}>😔</MenuItem>
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
                                value={this.state.lowTemperature}
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
                <Button variant="contained" aria-label="Delete" color="primary" size="large" className={classes.submitButton} onClick={this.addNewEntry}>
                    Add Entry 
                    <Send className={classes.sendIcon}/>
                </Button>
            </Paper>
        );
    }


    /* Methods */

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
        DriveHelper.postEntry({
            "title": this.state.customTitle, 
            "date": this.state.date,
            "bodyText": this.state.bodyText,
            "tallies": this.state.tallies, 
            "weather": new Weather(this.state.weather, this.state.lowTemperature, this.state.highTemperature, this.state.humidity), 
            "todos": this.state.todos,
            "mood": new Mood(this.state.mood)
        });
        this.setState({
            customTitle: '',
            date: new Date(),
            bodyText: '',
            mood: Mood.moodEnum.MEH,
            weather: 'Cloudy',
            lowTemperature: 60,
            highTemperature: 80, 
            humidity: 34,
            tallies: [],
            todos: [],
            newTallyMarkType: TallyMark.tallyTypeEnum.FOOD,
            newTallyMarkText: '',
            newTodoStatus: false,
            newTodoText: '',
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
}

Entry.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Entry)
