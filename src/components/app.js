/* global gapi */
import React, { Component } from 'react';
import { Menu } from './menu';
import { Home } from './pages/home/home';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: false,
    };
  }

  updateSignInStatus = () => {
    this.state.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get(); 
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient = () => {
    const that = this;
    gapi.client.init({
      apiKey: 'AIzaSyAF5oqaI0sUfsbIOp3ss66JCT7PuvuBgRA',
      clientId: '557447039683-srmcolp4qeuvkpvucjc06neq4d2gh1g0.apps.googleusercontent.com',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      scope: 'https://www.googleapis.com/auth/drive.appdata'
    }).then(function () {
      that.updateSignInStatus(); 
      that.forceUpdate();
    });
  };

  loadClientWhenGapiReady = (script) => {
    console.log('Loading client...');
    console.log(script)
    if(script.getAttribute('gapi_processed')){
      console.log('Gapi is ready');
      if(window.location.hostname==='localhost'){
        gapi.client.load("http://localhost:8080/_ah/api/discovery/v1/apis/metafields/v1/rest")
        .then((response) => {
          console.log("Connected to metafields API locally.");
          },
          function (err) {
            console.log("Error connecting to metafields API locally.");
          }
        );
      }
      gapi.load('client:auth2', this.initClient);
    } else{
      setTimeout(() => {this.loadClientWhenGapiReady(script)}, 50);
    }
  }

  componentDidMount() {
      console.log('Initializing GAPI...');
      const script = document.createElement("script");
      script.onload = () => {
        console.log('Loaded script, now loading our api...')
        // Gapi isn't available immediately so we have to wait until it is to use gapi.
        this.loadClientWhenGapiReady(script);
      };
      script.src = "https://apis.google.com/js/client.js";    
      document.body.appendChild(script);
  
    }

  // For API calls (create + update)
  // const boundary = '-------314159265358979323846264';
  // const delimiter = "\r\n--" + boundary + "\r\n";
  // const end_request = "\r\n--" + boundary + "--";

  render() {
    if(typeof gapi != "undefined") {
      this.updateSignInStatus();
      if(this.state.isSignedIn) {
        return (
          <div className="App">
            <Menu />
          </div>
        );
      } else {
        return (
          <div className="App">
            <Home />
          </div>
        );
      }      
    } 
    // Display nothing while loading
    return (
      <div className="App"></div>
    );
  }
}

export default App;
