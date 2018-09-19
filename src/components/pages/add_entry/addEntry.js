import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {TextField, MenuItem, Divider, Paper, Button, withStyles } from '@material-ui/core';
import NavigationIcon from '@material-ui/icons/Navigation';
import DriveHelper from '../../helpers/driveHelper';
import Mood from '../../objects/mood/mood'; 
import Weather from '../../objects/weather/weather'; 
import Todo from '../../objects/todos/todo'; 
import TallyMark from '../../objects/tallies/tallyMark';
import AddTally from './addTally';
import AddTodo from './addTodo';
import EntryStyling from './entryStyling';

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
        this.addTodo = this.addTodo.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    render() {
        const { classes } = this.props;
        const daysAlive = Math.round((new Date(this.state.date) - new Date(this.state.dateOfBirth)) / (1000 * 60 * 60 * 24));
        return (
            <Paper elevation={1} className={classes.paper}>

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
                    /> <br className={classes.hideWhenSmall}/>
                    <div className={classes.addTallyButton}><AddTally addNewTallyMark={this.addNewTallyMark}/></div> <br className={classes.hideWhenSmall}/>
                    <div className={classes.addTodoButton}><AddTodo addTodo={this.addTodo}/></div>
                </div>

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

                <TextField
                    id="outlined-select-mood"
                    select
                    label="Mood"
                    className="moodSelect"
                    value={this.state.mood}
                    onChange={this.handleInputChange}
                    margin="normal"
                    variant="outlined"
                >
                    <MenuItem key={Mood.moodEnum.MEH} value={Mood.moodEnum.MEH}>😐</MenuItem>
                    <MenuItem key={Mood.moodEnum.SAD} value={Mood.moodEnum.SAD}>🙂</MenuItem>
                    <MenuItem key={Mood.moodEnum.HAPPY} value={Mood.moodEnum.HAPPY}>😔</MenuItem>
                </TextField>

                <label htmlFor="weather">Weather Type</label>
                <input id="weather"
                    name="weather"
                    type="text"
                    required
                    value={this.state.weather}
                    onChange={this.handleInputChange} />
                <label htmlFor="lowTemperature">Low Temperature</label>
                <input id="lowTemperature"
                    name="lowTemperature"
                    type="number"
                    required
                    value={this.state.lowTemperature}
                    onChange={this.handleInputChange} />
                <label htmlFor="highTemperature">High Temperature</label>
                <input id="highTemperature"
                    name="highTemperature"
                    type="number"
                    required
                    value={this.state.highTemperature}
                    onChange={this.handleInputChange} />
                <label htmlFor="humidity">Humidity</label>
                <input id="humidity"
                    name="humidity"
                    type="number"
                    required
                    value={this.state.humidity}
                    onChange={this.handleInputChange} />

                <p>Tags Being Added: { this.state.tallies.map((currentValue)=> { return currentValue.type + currentValue.text}).toString() }</p>
                <p>Todos Being Added: { this.state.todos.map((currentValue)=> { return currentValue.status + currentValue.text}).toString() }</p>

                
                <Button variant="extendedFab" aria-label="Delete">
                    Submit
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

    addTodo(newTodoStatus, newTodoText) {
        this.setState(prevState => ({
            todos: [...prevState.todos, new Todo(newTodoStatus, newTodoText)]
          }))
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
