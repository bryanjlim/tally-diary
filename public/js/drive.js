// USE python -m SimpleHTTPServer 8000 TO RUN

// Client ID and API key from the Developer Console
var CLIENT_ID = '791384450603-2u28kubiema57qqtc2ff5hv4jg8a8tk5.apps.googleusercontent.com';
var API_KEY = 'AIzaSyD1oFD--xwW9z3fdOHZ8C0ARuk9E_zF7e8';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

// Auth variables 
var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

// For API calls (create + update)
const boundary = '-------314159265358979323846264';
const delimiter = "\r\n--" + boundary + "\r\n";
const end_request = "\r\n--" + boundary + "--";

/// AUTHENTICATION ///

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    $("#apiContainer").show(); 
    listFilesInAppData(); 
  } else {
    $("#apiContainer").hide(); 
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append an element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function log(message) {
  var logger = document.getElementById('logger');
  var textContent = document.createTextNode(message + '\n');
  logger.appendChild(textContent);
}

/// API CALLS ///

/**
 * Print the files present in the App Data folder in the logger. 
 */
function listFilesInAppData() {
    gapi.client.drive.files.list({
      'spaces': 'appDataFolder',
      'fields': "nextPageToken, files(id, name)",
      'pageSize': 25
    }).then((response) => {
      log('Files present in App Data:');
      console.log(response); 
      var files = response.result.files;
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          log(file.name + ' (' + file.id + ')');
        }
        log("\n")
      } else {
        log('No files found in App Data.');
      }
    });
  }

/**
 * Search for a file given the name of the file as a parameter. 
 * Design flaw: could have more than one file with a certain name. 
 * As of right now, it just takes the first file that's returned. 
 * 
 * @param {string} name Name of the file to be searched for 
 * @returns {Object} Thenable function (like a promise) holding the file id (string) data
 */
function getFileId(name) {
    return gapi.client.drive.files.list({
      'q': "name='" + name + "'",
      'spaces': 'appDataFolder',
      'fields': "nextPageToken, files(id, name)",
      'pageSize': 25
    }).then((response) => {
        var files = response.result.files;
        if (files && files.length > 0) {
            return files[0].id;
        }
    });
}

/**
 * Create a file for user data - should only be called once, 
 * then updated with the standard update route. 
 * 
 * @param {string} name User's name 
 * @param {string} birthday Date that the user was born, formatted as MM-DD-YYYY
 * @param {string} nickname User's preferred name 
 * @param {Object} preferences placeholder: user's app settings preferences 
 */
function insertUserData(name, birthday, nickname = name, preferences) {
    var appState = {
        "Name": name,
        "Date of Birth": birthday, 
        "Nickname": nickname, 
        "Preferences": preferences
    };
    var fileName = "User.json";
    var contentType = 'application/json';
    var metadata = {
      'name': fileName,
      'mimeType': contentType,
      'parents': ['appDataFolder']
    };
    var base64Data = btoa(JSON.stringify(appState));
    var multipartRequest =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        end_request;
    var request = gapi.client.request({
        'path': 'https://www.googleapis.com/upload/drive/v3/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequest});
    request.execute(function(arg) {
      console.log(arg);
    });
  }

 /**
  * Create a new diary entry file in the user's Google Drive under 
  * the name given as a parameter. 
  * 
  * @param {string} name Name of the diary entry to be created
  * @param {Object} date The entry's month, day, and year
  * @param {string} daysAlive The number of days the user has been alive based on the date
  * @param {string} entryBody The user's diary entry content
  * @param {number} mood An enumeration corresponding to the user's mood 
  * @param {array} tags An array of enumerations corresponding to how the user wants to categorize the entry
  * @param {Object} weather placeholder: an object describing the weather
  */
function insertDiaryEntry(entryName, date, daysAlive, entryBody, mood, tags = [], weather = {}) {
    // File content + metadata 
    var appState = {
        "title": entryName, 
        "date": date,
        "days alive": daysAlive,
        "body": entryBody,
        "tags": tags, 
        "weather": weather, 
        "mood": mood
    };
    var contentType = 'application/json';
    var metadata = {
      'name': entryName,
      'mimeType': contentType,
      'parents': ['appDataFolder']
    };
    var base64Data = btoa(JSON.stringify(appState));
    var multipartRequest =
        // metadata request 
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        // body content request 
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        end_request;
    var request = gapi.client.request({
        'path': 'https://www.googleapis.com/upload/drive/v3/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequest});
    request.execute(function(arg) {
      // arg returns false when an error occured 
      console.log(arg);
    });
  }

/**
 * Get the data from a file given the name of the file as a parameter. 
 * 
 * @param {string} name Name of the file to be read
 */
function readFile(name) {
    getFileId(name)
        .then((fileId) => {
            gapi.client.request({
                'path': 'https://www.googleapis.com/drive/v3/files/' + fileId,
                'method': 'GET', 
                'params': {
                    // could use fields to improve performance + reduce connection load
                    //'fields': 'body'

                    // returns full response 
                    'alt': 'media'
                }
            }).execute(((resp) => {
                console.log("METADATA"); 
                console.log(resp); 
                console.log("DIARY ENTRY"); 
                console.log(resp.body); 
                log('\nBody Text:\n' + resp.body + "\nCheck console for full output."); 
            })); 
        }); 
  }

  /**
  * Update either the metadata or the content of a file 
  * given the name of the file as a parameter. 
  * 
  * @param {string} name Name of the file to be edited. 
  * @param {Object} date The entry's month, day, and year
  * @param {string} daysAlive The number of days the user has been alive based on the date
  * @param {string} entryBody The user's diary entry content
  * @param {array} tags An array of enumerations corresponding to how the user wants to categorize the entry
  * @param {Object} weather placeholder: an object describing the weather
  * @param {number} mood An enumeration corresponding to the user's mood 
  */
  function updateFile(name, date, daysAlive, entryBody, tags, weather, mood) {
    // File content + metadata 
    var appState = {
        "title": name, 
        "date": date, 
        "days alive": daysAlive, 
        // To update content of the file 
        "body": entryBody,
        "tags": tags, 
        "weather": weather, 
        "mood": mood, 
    };
    var contentType = 'application/json';
    var metadata = {
      'name': name,
      'mimeType': contentType
    };
    var base64Data = btoa(JSON.stringify(appState));
    var multipartRequest =
        // metadata request
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        // body content request 
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        end_request;
    getFileId(name)
        .then((fileId) => {
            gapi.client.request({
                'path': 'https://www.googleapis.com/upload/drive/v3/files/' + fileId,
                'method': 'PATCH', 
                'params': {
                    'uploadType': 'multipart'
                },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                }, 
                'body': multipartRequest
            }).execute(); 
        }); 
  }

/**
 * Delete a file given the name of the file as a parameter. 
 * 
 * @param {string} name Name of the file to be deleted. 
 */
function deleteFile(name) {
    getFileId(name)
        .then((fileId) => {
            gapi.client.request({
                'path': 'https://www.googleapis.com/drive/v3/files/' + fileId,
                'method': 'DELETE'
            }).execute(); 
        }); 
  }

/// JQUERY ///

$("#createsubmit").click((e) => {
    console.log("CREATE"); 
    e.preventDefault();
    let postTitle = $("#createTitle").val();
    let postBody = $("#createBody").val(); 
    let date = $("#date").val().split("-"); 

    // mostly hard-coded for convenience. 
    // Two params are left out because I set them as optional. 
    insertDiaryEntry(postTitle, {
        "month": date[1], 
        "day": date[2], 
        "year": date[0]
    }, 6205, postBody, 1); 
  })

  $("#readsubmit").click((e) => {
    console.log("READ"); 
    e.preventDefault(); 
    let postTitle = $("#readInput").val();
    readFile(postTitle); 
  })

  $("#updatesubmit").click((e) => {
    console.log("UPDATE"); 
    e.preventDefault(); 
    let postTitle = $("#updatetitle").val(); 
    updateFile(postTitle); 
  })

  $("#deletesubmit").click((e) => {
    console.log("DELETE"); 
    e.preventDefault(); 
    let postTitle = $("#deleteInput").val();
    deleteFile(postTitle); 
  })

  $("#listFiles").click((e) => {
    console.log("LIST"); 
    e.preventDefault(); 
    listFilesInAppData(); 
  })
