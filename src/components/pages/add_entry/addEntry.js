import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import Mood from '../../objects/mood/mood';
import Weather from '../../objects/weather/weather';
import Todo from '../../objects/todos/todo';

export class AddEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // New Diary Entry
            customTitle: '',
            date: new Date(),
            bodyText: '',
            mood: Mood.moodEnum.MEH,
            weather: 'Cloudy',
            lowTemperature: 60,
            highTemperature: 80,
            humidity: 34,
            todos: [],

            // New Todo
            newTodoStatus: false,
            newTodoText: '',
        };
        this.addNewEntry = this.addNewEntry.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
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
            todos: [],
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
        return (
            <div>
                <h1>New Entry</h1>

                <h2>Add Todo To Entry - Left Checkbox = Todo Status - Right Textbox = Todo Text</h2>
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

                <h2>Main Submission Form</h2>
                <p>Todos Being Added: {this.state.todos.map((currentValue) => { return currentValue.status + currentValue.text }).toString()}</p>
                <form onSubmit={this.addNewEntry} className="add-entry-form">
                    <label htmlFor="customTitle">Title</label>
                    <input id="customTitle"
                        name="customTitle"
                        type="text"
                        value={this.state.customTitle}
                        onChange={this.handleInputChange} />
                    <label htmlFor="date">Date</label>
                    <input id="date"
                        name="date"
                        type="date"
                        required
                        value={this.state.date}
                        onChange={this.handleInputChange} />
                    <label htmlFor="bodyText">Body</label>
                    <input id="bodyText"
                        name="bodyText"
                        type="text"
                        required
                        value={this.state.bodyText}
                        onChange={this.handleInputChange} />
                    <label htmlFor="mood">Mood</label>
                    <select id="mood" name="mood" value={this.state.mood} onChange={this.handleInputChange}>
                        <option value={Mood.moodEnum.MEH}>Meh</option>
                        <option value={Mood.moodEnum.SAD}>Sad</option>
                        <option value={Mood.moodEnum.HAPPY}>Happy</option>
                    </select>
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
                    <button>Submit Diary Entry</button>
                </form>
            </div>
        );
    }
}

export default AddEntry;
