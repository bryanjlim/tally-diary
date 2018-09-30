/* global gapi */

export default class DriveHelper { 

    static boundary = '-------314159265358979323846264';
    static delimiter = "\r\n---------314159265358979323846264\r\n";
    static end_request = "\r\n---------314159265358979323846264--";

    static nonEntryFiles = 2;
    static userDataFileName = 'userData';
    static userTalliesFilename = 'userTallies';

    static postUserData(fileData) { 
        DriveHelper.postFile(this.userDataFileName, fileData);
    }

    static postTallies(allTallies){
        DriveHelper.postFile(this.userTalliesFilename, allTallies);
    }

    static postEntry(fileData, fileName) {
        DriveHelper.getFileCount().then((count) => {
            const fileName = count; // diary entries start at 1 and increment by 1 for each new diary entry
            DriveHelper.postFile(fileName, fileData);
        });
    }
    
    /**
     * Get the data from a file given the name of the file as a parameter. 
     * 
     * @param {string} fileName Name of the file to be read
     * @return {promise} 
     */
    static readFile(fileName) {
        return new Promise((resolve, reject) => {
            DriveHelper.getFileId(fileName)
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
                    if(!resp) {
                        reject("Error reading file");
                    } 
                    resolve(resp);
                })); 
            });
        });
    }

    /**
     * Create a new file in the user's Google Drive under 
     * the name given as a parameter. 
     * 
     * @param {string} fileName Name of the file to be posted
     * @param {Object} fileData Data of the file to be posted
     */
    static postFile(fileName, fileData) {
        const contentType = 'application/json';
        const metadata = {
            'name': fileName, // TODO: make file name the diary entry number
            'mimeType': contentType,
            'parents': ['appDataFolder']
        };
        const base64Data = btoa(JSON.stringify(fileData));
        const multipartRequest =
            // metadata request 
            DriveHelper.delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            DriveHelper.delimiter +
            // body content request 
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            DriveHelper.end_request;
        const request = gapi.client.request({
            'path': 'https://www.googleapis.com/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + DriveHelper.boundary + '"'
            },
            'body': multipartRequest});
        request.execute(function(arg) {
            // arg returns false when an error occured 
            console.log(arg);
        });
    }

    /**
     * Update either the metadata or the content of a file 
     * given the name of the file as a parameter. 
     * 
     * @param {string} fileName Name of the file to be edited. 
     * @param {Object} fileData Data of the file to be updated
     */
    static updateFile(fileName, fileData) {
        return new Promise((resolve, reject) => {
            // File content + metadata 
            const contentType = 'application/json';
            const metadata = {
            'name': fileName,
            'mimeType': contentType
            };
            const base64Data = btoa(JSON.stringify(fileData));
            const multipartRequest =
                // metadata request
                DriveHelper.delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                DriveHelper.delimiter +
                // body content request 
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                DriveHelper.end_request;
                DriveHelper.getFileId(fileName)
                .then((fileId) => {
                    gapi.client.request({
                        'path': 'https://www.googleapis.com/upload/drive/v3/files/' + fileId,
                        'method': 'PATCH', 
                        'params': {
                            'uploadType': 'multipart'
                        },
                        'headers': {
                            'Content-Type': 'multipart/mixed; boundary="' + DriveHelper.boundary + '"'
                        }, 
                        'body': multipartRequest
                    }).execute();
                    resolve();
                }).catch(err => reject(err)); 
        });   
    }

    /**
     * Delete a file given the name of the file as a parameter. 
     * 
     * @param {string} fileName Name of the file to be deleted. 
     */
    static deleteFile(fileName) {
        return new Promise((resolve, reject) => {
            DriveHelper.getFileId(fileName)
                .then((fileId) => {
                    gapi.client.request({
                        'path': 'https://www.googleapis.com/drive/v3/files/' + fileId,
                        'method': 'DELETE'
                    }).execute();
                    resolve();
                }).catch((err) => reject(err));
        });
    }

    /**
     * Search for a file given the name of the file as a parameter. 
     * Design flaw: could have more than one file with a certain name. 
     * As of right now, it just takes the first file that's returned. 
     * 
     * @param {string} fileName Name of the file to be searched for 
     * @returns {Object} Thenable function (like a promise) holding the file id (string) data
     */
    static getFileId(fileName) {
        return gapi.client.drive.files.list({
        'q': "name='" + fileName + "'",
        'spaces': 'appDataFolder',
        'fields': "nextPageToken, files(id, name)",
        'pageSize': 25
        }).then((response) => {
            const files = response.result.files;
            if (files && files.length > 0) {
                return files[0].id;
            } else{
                return null;
            }
        });
    }

    /**
     * Deletes all files
     * 
     */
    static deleteAllFiles() {
        gapi.client.drive.files.list({
            'spaces': 'appDataFolder',
            'fields': "nextPageToken, files(id, name)",
            'pageSize': 25
        }).then((response) => {
            const files = response.result.files;
            console.log("Files: " + JSON.stringify(files));
            for(let i=0; i< files.length; i++) {
                console.log("Index " + i);
                console.log("File Name: " + files[i].name);
                DriveHelper.deleteFile(files[i].name).then(() => {
                    if(i === files.length - 1) window.location.reload();
                });
            }
        }).catch(err => console.log("Error deleting all files: " + err));
    }

    /**
     * Gets the number of files in the app folder
     * 
     * @returns {promise} Holds integer of the number of files in the application folder
     */
    static getFileCount() {
        return new Promise((resolve, reject) => {
            gapi.client.drive.files.list({
                'spaces': 'appDataFolder',
                'fields': "nextPageToken, files(id, name)",
                'pageSize': 25
            }).then((response) => {
                // console.log('Files present in App Data:');
                // console.log(response); 
                const files = response.result.files;
                resolve(files.length);
            }).catch(err => reject(err));
        }); 
    }

    /**
     * Gets the number of files in the app folder
     * 
     * @returns {promise} Holds list of file objects with names and ids
     */
    static getFileList() {
        return new Promise((resolve, reject) => {
            gapi.client.drive.files.list({
                'spaces': 'appDataFolder',
                'fields': "nextPageToken, files(id, name)",
                'pageSize': 25
            }).then((response) => {
                // console.log('Files present in App Data:');
                // console.log(response); 
                const files = response.result.files;
                resolve(files);
            }).catch(err => reject(err));
        }); 
    }
}