/* global gapi */
import React, { Component } from 'react';
import DriveHelper from '../../helpers/driveHelper';
export class Settings extends Component {
    
    handleSubmit = () => {
        gapi.auth2.getAuthInstance().signOut();
    }
    
    render() {
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
}

export default Settings;
