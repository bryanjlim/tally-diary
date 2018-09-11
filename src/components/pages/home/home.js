import React, { Component } from 'react';
import { HomeNav } from './homeNav';
import './home.css';

export class Home extends Component {
    render() {
        return (
            <div>
                <div className="container">
                    <h1 className="centertext">Tally - A Diary that Tallies Your Life</h1>
                    <form className="centertext" ref="form" onSubmit={evt => { evt.preventDefault(); this.props.signIn(); }}>
                        <button type="submit">Get Started</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default Home;
