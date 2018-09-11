import React, { Component } from 'react';
import {HomeNav} from './HomeNav';
import './Home.scss';
export class Home extends Component {
  render() {
      return (
        <div>
            <HomeNav/>
            <h1>Tally</h1>
            <form ref="form" onSubmit={evt => {evt.preventDefault(); this.props.signIn();}}>
                <button type="submit">Get Started</button>
            </form>
        </div>
      );
  }
}

export default Home;
