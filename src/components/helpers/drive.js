/* global gapi */

export default class Drive { 

    static getFilesInAppData() {
        return new Promise((res, reject) => {
            gapi.client.drive.files.list({
                'spaces': 'appDataFolder',
                'fields': "nextPageToken, files(id, name)",
                'pageSize': 25
                }).then((response) => {
                    console.log(response); 
                    var files = response.result.files;
                    res(files);
                }).error((err) => {
                    reject(err);
                })
        });   
    }

    static postEntry(entryData) {
        const boundary = '-------314159265358979323846264';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const end_request = "\r\n--" + boundary + "--";

        const contentType = 'application/json';
        const metadata = {
            'name': entryData.title, // TODO: make file name the diary entry number
            'mimeType': contentType,
            'parents': ['appDataFolder']
        };
        const base64Data = btoa(JSON.stringify(entryData));
        const multipartRequest =
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
        const request = gapi.client.request({
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
}