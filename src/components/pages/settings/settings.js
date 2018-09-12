/* global gapi */
import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
export class Settings extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            showSuccessfulSave: false,
            showErrorSaving: false,
            firstName: '',
            lastName: '',
            dateOfBirth: new Date(),
            primaryTheme: '', //light or dark
            secondaryColor: '', // blue, red, orange, green, purple, or pink
            usePin: null,
            pin: '',
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.updateUserProperties = this.updateUserProperties.bind(this);
    }

    componentDidMount() {
        // TODO: use global state to get user settings once implemented
        var self = this;
        DriveHelper.readFile('0').then((res) => {
            self.setState({
                fistName: res.firstName,
                lastName: res.lastName,
                dateOfBirth: res.dateOfBirth,
                primaryTheme: res.primaryTheme,
                secondaryColor: res.secondaryColor,
                usePin: res.usePin,
                pin: res.pin,
                isLoading: false,
            }).catch((err) => {
                console.log(err);
            })
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

    updateUserProperties(e) {
        e.preventDefault();

        const updatedProperties = {
            "fistName": this.state.firstName,
            "lastName": this.state.lastName,
            "dateOfBirth": this.state.dateOfBirth,
            "primaryTheme": this.state.primaryTheme,
            "secondaryColor": this.state.secondaryColor,
            "usePin": this.state.usePin,
            "pin": this.state.pin,
        };
        DriveHelper.updateFile("0", updatedProperties).then(() => {
            console.log("successfully updated");
            this.setState({ showSuccessfulSave: true, showErrorSaving: false });
        }).catch((err) => {
            console.log("error saving: " + err);
            this.setState({ showErrorSaving: true, showSuccessfulSave: false});
    });
    }
    
    render() {
        if(this.state.isLoading === false) {
            return (
                <div>
                    <h1>User Settings</h1>
                    <h2>Update Information and Preferences</h2>
                    <form onSubmit={this.updateUserProperties} className="add-entry-form">

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

                    {this.state.showSuccessfulSave ? <p>Save Successful!</p> : this.state.showErrorSaving ? <p>Error saving file. Check console.</p> : null /* TODO: Better-looking notifications */}               

                    <h2>Account</h2>
                    <form ref="form" onSubmit={evt => {evt.preventDefault(); this.props.signOut();}}>
                        <button type="submit">Sign Out</button>
                    </form>
                    <button onClick={
                        //TODO: proper confirmation prompt
                        //eslint-disable-next-line 
                        () => {if(confirm("Delete All Files?")){DriveHelper.deleteAllFiles();}}
                        }>Delete All Files
                    </button>

                    
                </div>
            );
        }

        return null;
    }
}

export default Settings;
