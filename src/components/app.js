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
    this.state = { isSignedIn: false, };
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
    if(this.state.isSignedIn) {
      return (
        <div className="App">
          <Menu />
          { 
            (this.props.location.pathname === "/") ? <AddEntry /> : 
            (this.props.location.pathname === "/settings") ? <Settings signOut={this.signOut}/> : 
            <Timeline /> 
          }
        </div>
      );
    } else {
      return (
        <div className="App">
          <Home signIn = {this.signIn}/> { /* If user not signed in, display home page */ }
        </div>
      );
    }      
  } 


  /* GAPI */

  loadClientWhenGapiReady = (script) => {
    if(script.getAttribute('gapi_processed')){
      if(window.location.hostname==='localhost'){
        gapi.client.load("http://localhost:8080/_ah/api/discovery/v1/apis/metafields/v1/rest")
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
    }).catch((error) => {
      console.log(error);
    });
  };

  signIn() {
    gapi.auth2.getAuthInstance().signIn().then(()=> {
      this.updateSignInStatus();
    }).catch((error)=> {
      console.log(error);
    })
  }

  signOut() {
    gapi.auth2.getAuthInstance().signOut().then(()=> {
      window.location.href = '/';
      this.updateSignInStatus();
    }).catch((error)=> {
      console.log(error);
    })
  }

  updateSignInStatus = () => {
    this.state.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get(); 
    this.forceUpdate(); 
  };
}

export default App;