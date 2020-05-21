# zoom-archiver
Downloads Zoom Cloud recordings and uploads them to Google Drive

Requires you to setup a Zoom app with JWT token and a Google service account. Save the Google `credentials.json` and following `config.json` file in root directory.


```
const config = {
    zoom: {
        // JWT APP Token
        token: 'exampleKNpN177KTB_XW-wLQ9o',
        baseUrl: 'https://api.zoom.us/v2',
        limit: 2, // Number of recordings to return (300 max)
        from: '2020-04-01', // only return recordings between these dates
        to: '2020-05-04'
    },
    downloadFolder: '/share/zoom-archiver-backup/downloads',
    gdriveUploadFolder: 'example12YIyHHtSj' // Folder ID
};

module.exports = config;
```