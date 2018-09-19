import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import NavigationIcon from '@material-ui/icons/Navigation';
import DriveHelper from '../../helpers/driveHelper';
import Mood from '../../objects/mood/mood'; 
import Weather from '../../objects/weather/weather'; 
import Todo from '../../objects/todos/todo'; 
import TallyMark from '../../objects/tallies/tallyMark';
import AddTally from './add_tally/addTally';


import './entry.css'

export class AddEntry extends Component {
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

            // New Todo
            newTodoStatus: false,
            newTodoText: '',
        };
        this.addNewEntry = this.addNewEntry.bind(this);
        this.addNewTallyMark = this.addNewTallyMark.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    addNewTallyMark(newTallyMarkType, newTallyMarkText) {
        this.setState(prevState => ({
            tallies: [...prevState.tallies, new TallyMark(newTallyMarkType, newTallyMarkText)]
          }))
    }

    addTodo(e) {
        e.preventDefault();
        this.state.todos.push(new Todo(this.state.newTodoStatus, this.state.newTodoText));
        this.setState({
            newTodoStatus: false,
            newTodoText: '',
        }); 
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

    render() {
        const daysAlive = Math.round((new Date(this.state.date) - new Date(this.state.dateOfBirth)) / (1000 * 60 * 60 * 24));
        return (
            <Paper elevation={1}>
                <h1>New Entry</h1>

                <AddTally addNewTallyMark={this.addNewTallyMark}/>
        
                <h2>Add Todo To Entry</h2>
                <form onSubmit={this.addTodo} className="add-todo-form">
                    <input id="newTodoStatus"
                        name="newTodoStatus"
                        type="checkbox"
                        checked={this.state.newTodoStatus}
                        onChange={this.handleInputChange} />
                    <input id="newTodoText"
                        name="newTodoText"
                        type="text"
                        required
                        value={this.state.newTodoText}
                        onChange={this.handleInputChange} />
                    <button>Add Todo</button>
                </form>

                <Divider />

                <h2>Main Submission Form</h2>
                <p>Tags Being Added: { this.state.tallies.map((currentValue)=> { return currentValue.type + currentValue.text}).toString() }</p>
                <p>Todos Being Added: { this.state.todos.map((currentValue)=> { return currentValue.status + currentValue.text}).toString() }</p>
                <form onSubmit={this.addNewEntry} className="container">

                    <TextField
                        label="Title"
                        id="customTitle"
                        className="customTitle"
                        name="customTitle"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">{"Day " + daysAlive + " "}</InputAdornment>,
                        }}
                    />

                    <TextField
                        id="date"
                        name="date"
                        label="Date"
                        type="date"
                        value={this.state.date}
                        onChange={this.handleInputChange}
                        className='textField'
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <Divider />

                    <TextField
                        name="bodyText"
                        id="outlined-multiline-static"
                        label="Your Thoughts"
                        multiline
                        rows="10"
                        value={this.state.bodyText}
                        onChange={this.handleInputChange}
                        className='bodyText'
                        margin="normal"
                        variant="outlined"
                    />

                    <Divider />

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

                    <Divider />

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

                    <Divider />
                    
                    <Button variant="extendedFab" aria-label="Delete">
                        <NavigationIcon />
                        Submit
                    </Button>
                </form>
            </Paper>
        );
    }
}

export default AddEntry;
