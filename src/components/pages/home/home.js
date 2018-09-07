/* global gapi */
import React, { Component } from 'react';

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: false,
    };
  }

  handleSubmit = () => {
    gapi.auth2.getAuthInstance().signIn();
  }

  render() {
      return (
        <div>
            <h1>Home Page</h1>
            <form ref="form" onSubmit={this.handleSubmit}>
                <button type="submit">Get Started</button>
            </form>
        </div>
      );
  }
}

export default Home;
