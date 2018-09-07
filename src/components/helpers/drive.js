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

}