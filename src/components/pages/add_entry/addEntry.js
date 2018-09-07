import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
import Mood from '../../objects/mood/mood'; 
import Weather from '../../objects/weather/weather'; 
import Todo from '../../objects/todos/todo'; 
import TallyMark from '../../objects/tallies/tallyMark';

export class AddEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // New Diary Entry
            customTitle: '',
            date: new Date(),
            bodyText: '',
            mood: new Mood(Mood.moodEnum.MEH), // TODO: Add dropdown menu for mood in main submission form
            weather: new Weather("Cloudy", 60, 80, 34), // TODO: Add fields for weather in main submission form
            tallies: [],
            todos: [],

            // New Tally Mark
            newTallyMarkType: TallyMark.tallyTypeEnum.FOOD,
            newTallyMarkText: '',

            // New Todo
            newTodoStatus: false,
            newTodoText: '',
        };
        this.addNewEntry = this.addNewEntry.bind(this);
        this.addNewTallyMark = this.addNewTallyMark.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    addNewTallyMark(e) {
        e.preventDefault();
        this.state.tallies.push(new TallyMark(this.state.newTallyMarkType, this.state.newTallyMarkText));
        this.setState({
            newTallyMarkType: TallyMark.tallyTypeEnum.FOOD,
            newTallyMarkText: '',
        }); 
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
            "title": this.state.title, 
            "date": this.state.date,
            "bodyText": this.state.bodyText,
            "tallies": this.state.tallies, 
            "weather": this.state.weather, 
            "todos": this.state.todos,
            "mood": this.state.mood
        });
        this.setState({
            customTitle: '',
            date: new Date(),
            bodyText: '',
            mood: new Mood(Mood.moodEnum.MEH), // TODO: Add dropdown menu for mood in main submission form
            weather: new Weather("Cloudy", 60, 80, 34), // TODO: Add fields for weather in main submission form
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
        return (
            <div>
                <h1>New Entry</h1>

                <h2>Add Tally Mark To Entry - Left Dropdown = Tally Type - Right Textbox = Tally Mark Text</h2>
                <form onSubmit={this.addNewTallyMark} className="add-tally-mark-form">
                    <select name="newTallyMarkType" value={this.state.selectedTallyMarkType} onChange={this.handleInputChange}>
                        <option value={TallyMark.tallyTypeEnum.FOOD}>Food</option>
                        <option value={TallyMark.tallyTypeEnum.ACTIVITY}>Activity</option>
                        <option value={TallyMark.tallyTypeEnum.LANDMARK}>Landmark</option>
                        <option value={TallyMark.tallyTypeEnum.PERSON}>Person</option>
                        <option value={TallyMark.tallyTypeEnum.OTHER}>Other</option>
                    </select>
                    <input id="newTallyMarkText"
                        name="newTallyMarkText"
                        type="text"
                        required
                        value={this.state.newTallyMarkText}
                        onChange={this.handleInputChange} />
                    <button>Add Tally Mark</button>
                </form>

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
                <p>Tags Being Added: { this.state.tallies.map((currentValue)=> { return currentValue.type + currentValue.text}).toString() }</p>
                <p>Todos Being Added: { this.state.todos.map((currentValue)=> { return currentValue.status + currentValue.text}).toString() }</p>
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
                        value={this.state.body}
                        onChange={this.handleInputChange} />
                    <button>Submit Diary Entry</button>
                </form>
            </div>
        );
    }
}

export default AddEntry;
