# zoom-archiver
Downloads Zoom Cloud recordings and uploads them to Google Drive

Start by creating a Zoom app and obtain a JWT token to authenticate against their API

Then you will need to create a Google service account that uses OAuth2 to connect to the Google Drive API
https://developers.google.com/identity/protocols/oauth2/service-account
1. Create a service account in the Google Developer Console and download the credentials.json
2. Delegate domain-wide authority to the service account so it can act on behalf of users
3. Assign the Google Drive API scope to the service account in G Suite Admin console


Save the Google `credentials.json` and create the following `config.json` file in the root directory.

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