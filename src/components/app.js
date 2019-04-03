/* global gapi */
import React, { Component } from 'react';
import { CircularProgress, withStyles, Snackbar, IconButton, MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import lightBlue from '@material-ui/core/colors/lightBlue';
import pink from '@material-ui/core/colors/pink';
import CloseIcon from '@material-ui/icons/Close';
import DriveHelper from './helpers/driveHelper';
import Home from './pages/home/home';
import PrivacyPolicy from './pages/privacy_policy/privacyPolicy';
import Contact from './pages/contact/contact';
import AboutUs from './pages/about_us/aboutUs';
import Entry from './pages/entry/entry';
import NewUserSetup from './pages/new_user_setup/newUserSetup';
import Settings from './pages/settings/settings';
import Timeline from './pages/timeline/timeline';
import Insights from './pages/insights/insights';
import Layout from './layout';
import userPreferenceStore from '../stores/userPreferenceStore';
import diaryEntryStore from '../stores/diaryEntryStore';
import PasswordUnlock from './views/passwordUnlock/passwordUnlock';
import EntryViewer from './views/diaryEntries/entryViewer';
import PropTypes from 'prop-types';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: lightBlue[200],
    },
    secondary: {
      main: pink[300]
    },
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInitialized: false,
      isSignedIn: false,
      newUserSetup: false,
      passwordChecked: false,
      justFinishedSetup: false,
      showSignOutError: false,
      signOutError: '',
    };
    this.loadClientWhenGapiReady = this.loadClientWhenGapiReady.bind(this);
    this.initClient = this.initClient.bind(this);
    this.updateSignInStatus = this.updateSignInStatus.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.loadUserPreferencesStore = this.loadUserPreferencesStore.bind(this);
    this.loadDiaryEntryStore = this.loadDiaryEntryStore.bind(this); 
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
    const { classes } = this.props;

    const pathname = this.props.location.pathname;

    if(pathname === "/privacy-policy") {
      return(<PrivacyPolicy/>)
    }
    if(pathname === "/about") {
      return(<AboutUs/>)
    }
    if(pathname === "/contact") {
      return(<Contact/>)
    }
    
    if (!this.state.isInitialized) {
      // Loading Circle
      return (<div className={classes.outerContainer}> 
              <div className={classes.middleContainer}> 
              <div className={classes.innerContainer}> 
              <CircularProgress/></div></div></div>); 
    }
    if (this.state.newUserSetup) {
      return (
        <NewUserSetup doneWithSetup={(userData) => {
          this.setState({ newUserSetup: false, justFinishedSetup: true, }); userPreferenceStore.preferences = userData; }} />
      );
    }
    if (this.state.isSignedIn) {
      if (userPreferenceStore.preferences.usePassword && !this.state.passwordChecked && !this.state.justFinishedSetup) {
        // User needs to enter password
        return (
          <PasswordUnlock userStore={userPreferenceStore} onPasswordChecked={this.onPasswordChecked}/>
        );
      } else {
        return (
          // Tally Diary App
          <MuiThemeProvider theme={userPreferenceStore.preferences.primaryTheme == "dark" ? theme : null}>
            <Layout>
              <div>
                  {
                    (pathname === "/") ? 
                    <Entry userStore={userPreferenceStore} diaryEntryStore={diaryEntryStore} adding={true} /> :
                      (pathname === "/settings") ? 
                      <Settings signOut={this.signOut} userStore={userPreferenceStore} diaryEntryStore={diaryEntryStore}/> :
                        (pathname === "/insights") ? 
                        <Insights diaryEntryStore={diaryEntryStore} userStore={userPreferenceStore}/> :
                          (pathname === "/timeline") ? 
                          <Timeline userStore={userPreferenceStore} diaryEntryStore={diaryEntryStore}
                                    router={this.props.router}/> :
                            <EntryViewer entryIndex={pathname.substring(10, pathname.length)} router={this.props.router}
                                        diaryEntryStore={diaryEntryStore} userStore={userPreferenceStore}/>
                  }
                  <Snackbar
                    open={this.state.showSignOutError}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span>Error Signing Out: {this.state.signOutError}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={() => {this.setState({showSignOutError: false})}}
                        >
                            <CloseIcon className={classes.icon} />
                        </IconButton>
                    ]}
                  />
              </div>
            </Layout>
          </MuiThemeProvider>
        );
      }
    } else {
      // Tally Diary Info (Home) Page
      return (
        <div>
          <Home signIn={this.signIn} />
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
      apiKey: 'AIzaSyAuKJs7B5EiTmFyjP8cg974vCsqS98QvYA',
      clientId: '577206274010-4f6qsvjb1fqbq70ob8ium2eac4ikd8g8.apps.googleusercontent.com',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      scope: 'https://www.googleapis.com/auth/drive.appdata',
      ux_mode: 'redirect',
    }).then(() => {
      that.updateSignInStatus();
      if (that.state.isSignedIn) {
        DriveHelper.getFileCount().then((count) => {
          if (count === 0) {
            that.setState({ 
              newUserSetup: true, 
              isInitialized: true,
            });
          } else {
            this.loadUserPreferencesStore().then(() => {
              this.loadDiaryEntryStore().then(() => {
                that.setState({ isInitialized: true });
              });
            }).catch((err) => console.log(err));
          }
        });
      } else {
        that.setState({ isInitialized: true });
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  signIn() {
    gapi.auth2.getAuthInstance().signIn({prompt: 'select_account'}).then(() => {
      DriveHelper.getFileCount().then((count) => {
        if (count === 0) {
          this.setState({ newUserSetup: true });
        } else {
          this.loadUserPreferencesStore().then(() => {
            this.loadDiaryEntryStore().then(() => {
              this.setState({ isInitialized: true });
              this.updateSignInStatus();
            });
          }).catch(err => console.log(err));
        }
      });
    }).catch((error) => {
      console.log(error);
      window.location.reload();
    })
  }

  signOut() {
    gapi.auth2.getAuthInstance().signOut().then(() => {
      window.location.href = '/';
      this.updateSignInStatus();
    }).catch((error) => {
      this.setState({
        showSignOutError: true,
        signOutError: error,
      })
    })
  }

  updateSignInStatus = () => {
    this.setState({ isSignedIn: gapi.auth2.getAuthInstance().isSignedIn.get() });
  };

  loadUserPreferencesStore = () => {
    return new Promise((resolve, reject) => {
      DriveHelper.getUserData().then((res) => { 
        userPreferenceStore.preferences = res;
        userPreferenceStore.preferences.appLaunches += 1;
        DriveHelper.updateUserData(userPreferenceStore.preferences);
        resolve();
      }).catch((err) => {
          reject(err);
      });
    });
  };

  loadDiaryEntryStore = () => {
    return new Promise((resolve, reject) => {
      DriveHelper.getEntries().then((res) => {
        let temp = res;
        if(temp != null && temp != undefined && temp.length != undefined) {
          temp.sort((a, b) => {
            // Sorts diaries in descending order by date
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        } else {
          temp = [];
        }
        diaryEntryStore.entries = temp;
        resolve();
      }).catch(err => reject(err));
    });
  }

  onPasswordChecked = () => {
    this.setState({
      passwordChecked: true,
    }); 
  };
}

const styles = theme => ({
  outerContainer: {
    backgroundColor: '#D3D3D3',
    fontFamily: 'Roboto',
    display: 'table',
    position: 'absolute',
    marginTop: -30,
    marginBottom: -30,
    marginLeft: -20,
    marginRight: -20,
    height: '103%',
    width: '103%',
    overflow: 'hidden',
  },
  middleContainer: {
      display: 'table-cell',
      verticalAlign: 'middle',
  },
  innerContainer: {
      textAlign: 'center',
  },
  card: {
    fontFamily: 'Roboto',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '2em',
    paddingBottom: '1em',
    paddingLeft: '1em',
  },
});

App.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(App);
