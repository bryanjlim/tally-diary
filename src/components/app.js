/* global gapi */
import React, { Component } from 'react';
import DriveHelper from './helpers/driveHelper';
import { NewUserSetup } from './pages/new_user_setup/newUserSetup';
import { Menu } from './navigation/menu/menu.js';
import { Home } from './pages/home/home';
import { HomeNav } from './navigation/home/homeNav';
import { Contact } from './pages/contact/contact';
import { AboutUs } from './pages/about_us/aboutUs';
import { AddEntry } from './pages/add_entry/addEntry';
import { Settings } from './pages/settings/settings';
import { Timeline } from './pages/timeline/timeline';
import { Insights } from './pages/insights/insights';
import '../styles.css';
export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInitialized: false,
      isSignedIn: false,
      newUserSetup: false,
    };
    this.loadClientWhenGapiReady = this.loadClientWhenGapiReady.bind(this);
    this.initClient = this.initClient.bind(this);
    this.updateSignInStatus = this.updateSignInStatus.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  componentDidMount() {
    const script = document.createElement("script");
    script.onload = () => {
      this.loadClientWhenGapiReady(script);
    };
    script.src = "https://apis.google.com/js/client.js";
    document.body.appendChild(script);
  }

  render() {
    if (!this.state.isInitialized) return null;
    if (this.state.newUserSetup) {
      return (
        <NewUserSetup doneWithSetup={() => this.setState({ newUserSetup: false })} />
      );
    }
    if (this.state.isSignedIn) {
      return (
        <div className="App">
          <Menu />
          <div className="container">
            {
              (this.props.location.pathname === "/") ? <AddEntry /> :
                (this.props.location.pathname === "/settings") ? <Settings signOut={this.signOut} /> :
                  (this.props.location.pathname === "/insights") ? <Insights /> :
                    <Timeline />
            }
          </div>
        </div>
      );
    } else {
      return (
        <div className="App">
          <HomeNav />
          <div className="container">
            {
              (this.props.location.pathname === "/aboutus") ? <AboutUs /> :
                (this.props.location.pathname === "/contact") ? <Contact /> :
                  <Home signIn={this.signIn} />
            }
          </div>
        </div>
      );
    }

  }

  /* GAPI */

  loadClientWhenGapiReady = (script) => {
    if (script.getAttribute('gapi_processed')) {
      if (window.location.hostname === 'localhost') {
        gapi.client.load("http://localhost:8080/_ah/api/discovery/v1/apis/metafields/v1/rest")
      }
      gapi.load('client:auth2', this.initClient);
    } else {
      setTimeout(() => { this.loadClientWhenGapiReady(script) }, 50);
    }
  }

  initClient = () => {
    const that = this;
    gapi.client.init({
      apiKey: 'AIzaSyAF5oqaI0sUfsbIOp3ss66JCT7PuvuBgRA',
      clientId: '557447039683-srmcolp4qeuvkpvucjc06neq4d2gh1g0.apps.googleusercontent.com',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      scope: 'https://www.googleapis.com/auth/drive.appdata'
    }).then(() => {
      that.updateSignInStatus();
      if (that.state.isSignedIn) {
        DriveHelper.getFileCount().then((count) => {
          if (count === 0) {
            that.setState({ newUserSetup: true });
          }
          that.setState({ isInitialized: true });
        });
      } else {
        that.setState({ isInitialized: true });
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  signIn() {
    gapi.auth2.getAuthInstance().signIn().then(() => {
      DriveHelper.getFileCount().then((count) => {
        if (count === 0) {
          this.setState({ newUserSetup: true });
        }
        this.updateSignInStatus();
      });
    }).catch((error) => {
      console.log(error);
    })
  }

  signOut() {
    gapi.auth2.getAuthInstance().signOut().then(() => {
      window.location.href = '/';
      this.updateSignInStatus();
    }).catch((error) => {
      console.log(error);
    })
  }

  updateSignInStatus = () => {
    this.setState({ isSignedIn: gapi.auth2.getAuthInstance().isSignedIn.get() });
    this.forceUpdate();
  };
}

export default App;
