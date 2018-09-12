import React, { Component } from 'react';
import { HomeNav } from './homeNav';
import './home.css';

export class Home extends Component {
    render() {
        return (
            <div className="centered">
                <h1 className="homeTitle">Tally - A Diary that Tallies Your Life</h1>
                <form ref="form" onSubmit={evt => { evt.preventDefault(); this.props.signIn(); }}>
                    <button className="getStartedButton" type="submit">Get Started</button>
                </form>
            </div>
        );
    }
}

export default Home;
