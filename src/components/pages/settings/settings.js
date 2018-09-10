/* global gapi */
import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
export class Settings extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            firstName: '',
            lastName: '',
            dateOfBirth: new Date(),
            primaryTheme: '', //light or dark
            secondaryColor: '', // blue, red, orange, green, purple, or pink
            usePin: null,
            pin: '',
        };
    }

    componentDidMount() {
        // TODO: use global state to get user settings once implemented

        DriveHelper.readFile('0').then((res) => {
            this.setState({
                fistName: res.firstName,
                lastName: res.lastName,
                dateOfBirth: res.dateOfBirth,
                primaryTheme: res.primaryTheme,
                secondaryColor: res.secondaryColor,
                usePin: res.usePin,
                pin: res.pin,
                isLoading: false,
            });
        });
    }

    handleSubmit = () => {
        gapi.auth2.getAuthInstance().signOut();
    }
    
    render() {
        if(this.state.isLoading === false) {
            return (
                <div>
                    <h1>User Settings</h1>
                    <h2>Personalization</h2>
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
