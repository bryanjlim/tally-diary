/* global gapi */
import React, { Component } from 'react';
import { Menu } from './menu';
import { Home } from './pages/home/home';
import { AddEntry } from './pages/add_entry/addEntry';
import { Settings } from './pages/settings/settings';
import { Timeline } from './pages/timeline/timeline';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSignedIn: false,
    };
    this.initClient = this.initClient.bind(this);
    this.updateSignInStatus = this.updateSignInStatus.bind(this);
    this.loadClientWhenGapiReady = this.loadClientWhenGapiReady.bind(this);
    this.signIn = this.signIn.bind(this);
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
    if(this.state.isSignedIn) {
      return (
        <div className="App">
          <Menu />
          { 
            (this.props.location.pathname === "/") ? <AddEntry /> : 
            (this.props.location.pathname === "/settings") ? <Settings /> : 
            <Timeline /> 
          }
        </div>
      );
    } else {
      return (
        <div className="App">
          <Home onSubmit = {this.signIn}/> {/* If user not signed in, display home page */}
        </div>
      );
    }      
  } 


  /* Methods for Google Drive */

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

  initClient = () => {
    const that = this;
    gapi.client.init({
      apiKey: 'AIzaSyAF5oqaI0sUfsbIOp3ss66JCT7PuvuBgRA',
      clientId: '557447039683-srmcolp4qeuvkpvucjc06neq4d2gh1g0.apps.googleusercontent.com',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      scope: 'https://www.googleapis.com/auth/drive.appdata'
    }).then(() => {
      that.updateSignInStatus(); 
      that.forceUpdate();
    });
  };

  updateSignInStatus = () => {
    this.state.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get(); 
    this.forceUpdate(); 
  };

  signIn() {
    gapi.auth2.getAuthInstance().signIn().then(()=> {
      this.updateSignInStatus();
    }).catch((error)=> {
      console.log(error);
    })
  }

  // For API calls (create + update)
  // const boundary = '-------314159265358979323846264';
  // const delimiter = "\r\n--" + boundary + "\r\n";
  // const end_request = "\r\n--" + boundary + "--";
}

export default App;
