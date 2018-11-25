/* global gapi */

export default class DriveHelper { 

    static boundary = '-------314159265358979323846264';
    static delimiter = "\r\n---------314159265358979323846264\r\n";
    static end_request = "\r\n---------314159265358979323846264--";

    static nonEntryFileCount = 1;
    
    static getUserData() {
        return new Promise((resolve, reject) => {
            DriveHelper.readFile('0').then((res) => { // User Properties stored in file '0'
              const userData = {
                fistName: res.firstName,
                lastName: res.lastName,
                dateOfBirth: res.dateOfBirth,
                primaryTheme: res.primaryTheme,
                secondaryColor: res.secondaryColor,
                usePassword: res.usePassword,
                password: res.password,
              };
              resolve(userData);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    static postUserData(fileData) {
        const fileName = 0; // User Properties stored in file '0'
        DriveHelper.postFile(fileName, fileData);
    }

    static updateUserData(fileData) {
        DriveHelper.updateFile("0", fileData); // User Properties stored in file '0'
    }

    static getEntries() {
        return new Promise((resolve, reject) => {
            DriveHelper.readFile('1').then((res) => { // Diary Entries stored in file '1' in array entries
              resolve(res);
            }).catch(err => reject(err));
        });
    }

    static postEntries(fileData) {
        const fileName = 1; // Diary Entries stored in file '1' in array entries
        DriveHelper.postFile(fileName, fileData);
    }

    static updateEntries(fileData) {
        const fileName = 1; // Diary Entries stored in file '1' in array entries
        DriveHelper.updateFile(fileName, fileData);
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
     * Create a new diary entry file in the user's Google Drive under 
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
            }
        });
    }

    /**
     * Deletes all files
     * 
     */
    static deleteAllFiles() {
        DriveHelper.getFileList().then((files) => {
            const index = files.length - 1;
            DriveHelper.removeFiles(index);
        }).catch(err => console.log(err));
    }

    /**
     * Recurseively removes all files starting from highest index and moving down to 0
     * 
     */
    static removeFiles(index) {
        return new Promise((resolve, reject) => {
            if(Number(index) === -1) {
                resolve();
            }
            DriveHelper.deleteFile(index).then(() => {
                DriveHelper.removeFiles(Number(index) - 1).then(()=> {
                    resolve();
                })
            }).catch(err => reject(err));
        });
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
            }).catch(error => reject(error));
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
            }).catch(error => reject(error));
        }); 
    }
}