/* global gapi */
import React, { Component } from 'react';
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
                <form ref="form" onSubmit={this.handleSubmit}>
                    <button type="submit">Sign Out</button>
                </form>
            </div>
        );
    }
}

export default Settings;
