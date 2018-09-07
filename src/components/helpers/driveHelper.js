/* global gapi */

export default class DriveHelper { 

    static boundary = '-------314159265358979323846264';
    static delimiter = "\r\n---------314159265358979323846264\r\n";
    static end_request = "\r\n---------314159265358979323846264--";
    
    static postEntry(fileData) {
        const fileName = 1; // TODO: set file name to entry number
        this.postFile(fileName, fileData);
    }

    /**
     * Get the data from a file given the name of the file as a parameter. 
     * 
     * @param {string} fileName Name of the file to be read
     * @return {promise} 
     */
    static readFile(fileName) {
        return new Promise((resolve, reject) => {
            this.getFileId(fileName)
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
                    resolve(resp.body);
                })); 
            }).error(err => reject(err));
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
            this.delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            this.delimiter +
            // body content request 
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            this.end_request;
        const request = gapi.client.request({
            'path': 'https://www.googleapis.com/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + this.boundary + '"'
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
        // File content + metadata 
        const contentType = 'application/json';
        const metadata = {
          'name': fileName,
          'mimeType': contentType
        };
        const base64Data = btoa(JSON.stringify(fileData));
        const multipartRequest =
            // metadata request
            this.delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            this.delimiter +
            // body content request 
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            this.end_request;
            this.getFileId(fileName)
            .then((fileId) => {
                gapi.client.request({
                    'path': 'https://www.googleapis.com/upload/drive/v3/files/' + fileId,
                    'method': 'PATCH', 
                    'params': {
                        'uploadType': 'multipart'
                    },
                    'headers': {
                        'Content-Type': 'multipart/mixed; boundary="' + this.boundary + '"'
                    }, 
                    'body': multipartRequest
                }).execute(); 
            }); 
    }

    /**
     * Delete a file given the name of the file as a parameter. 
     * 
     * @param {string} fileName Name of the file to be deleted. 
     */
    static deleteFile(fileName) {
        this.getFileId(fileName)
            .then((fileId) => {
                gapi.client.request({
                    'path': 'https://www.googleapis.com/drive/v3/files/' + fileId,
                    'method': 'DELETE'
                }).execute(); 
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
     * Print the files present in the App Data folder in the logger. 
     */
    static listFilesInAppData() {
        gapi.client.drive.files.list({
            'spaces': 'appDataFolder',
            'fields': "nextPageToken, files(id, name)",
            'pageSize': 25
        }).then((response) => {
            console.log('Files present in App Data:');
            console.log(response); 
            var files = response.result.files;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                var file = files[i];
                console.log(file.name + ' (' + file.id + ')');
                }
                console.log("\n")
            } else {
                console.log('No files found in App Data.');
            }
        });
    }
}