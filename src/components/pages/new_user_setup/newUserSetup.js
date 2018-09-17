/* global gapi */
import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';

export class NewUserSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            dateOfBirth: new Date(),
            primaryTheme: "light", //light or dark
            secondaryColor: "blue", // blue, red, orange, green, purple, or pink
            usePin: false,
            pin: '',
        };
        this.addUserProperties = this.addUserProperties.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {
        const basicProfileInfo = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        this.setState({
            firstName: basicProfileInfo.getGivenName(),
            lastName: basicProfileInfo.getFamilyName()
        }); 
    }

    addUserProperties(e) {
        e.preventDefault();
        const userData = {
            "firstName": this.state.firstName, 
            "lastName": this.state.lastName,
            "dateOfBirth": this.state.dateOfBirth,
            "primaryTheme": this.state.primaryTheme, 
            "secondaryColor": this.state.secondaryColor, 
            "usePin": this.state.usePin,
            "pin": this.state.pin
        };
        DriveHelper.postUserData(userData);
        this.props.doneWithSetup(userData);
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
                <h1>Welcome To Tally Diary, {this.state.firstName}!</h1>

                <h2>Set Information and Preferences</h2>
                <form onSubmit={this.addUserProperties} className="add-entry-form">

                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        required
                        value={this.state.dateOfBirth}
                        onChange={this.handleInputChange} />

                    <label htmlFor="usePin">Use Pin?</label>
                    <input id="usePin"
                        name="usePin"
                        type="checkbox"
                        checked={this.state.usePin}
                        onChange={this.handleInputChange} />

                    <label htmlFor="pin">Pin</label>
                    <input id="pin"
                        name="pin"
                        type="text"
                        value={this.state.pin}
                        onChange={this.handleInputChange} />

                    <label htmlFor="primaryTheme">Theme</label>
                    <select name="primaryTheme" value={this.state.primaryTheme} onChange={this.handleInputChange}>
                        <option value={"light"}>Light</option>
                        <option value={"dark"}>Dark</option>
                    </select>

                    <label htmlFor="secondaryColor">Secondary Color</label>
                    <select name="secondaryColor" value={this.state.secondaryColor} onChange={this.handleInputChange}>
                        <option value={"blue"}>Blue</option>
                        <option value={"red"}>Red</option>
                        <option value={"green"}>Green</option>
                        <option value={"orange"}>Orange</option>
                        <option value={"purple"}>Purple</option>
                        <option value={"pink"}>Pink</option>
                    </select>
                    
                    <button>Save</button>
                </form>

                <i>This information is stored in your Google Drive's reserved application folder, only accessible by the Tally Diary app. Tally Diary never and will never store your data on its own servers. </i>
            </div>
        );
    }
}

export default NewUserSetup;
