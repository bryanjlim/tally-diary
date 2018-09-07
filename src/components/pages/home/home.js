import React, { Component } from 'react';

export class Home extends Component {
  render() {
      return (
        <div>
            <h1>Home Page</h1>
            <form ref="form" onSubmit={evt => {evt.preventDefault(); this.props.signIn();}}>
                <button type="submit">Get Started</button>
            </form>
        </div>
      );
  }
}

export default Home;
