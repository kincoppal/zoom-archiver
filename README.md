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
        from: '2020-04-01', // Only return recordings starting from this date
        daysToKeep: 14 // Number of days to leave on Zoom Cloud
    },
    downloadFolder: '/share/zoom-archiver-backup/downloads',
    gdriveUploadFolder: 'example12YIyHHtSj' // Folder ID
};

module.exports = config;
```