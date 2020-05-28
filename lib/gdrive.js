// Used this blog post as a guide: https://medium.com/@bretcameron/how-to-use-the-google-drive-api-with-javascript-57a6cc9e5262
// Then changed to "three legged OAuth" thanks to the following:
//  - https://developers.google.com/identity/protocols/oauth2/service-account
//  - https://github.com/googleapis/google-api-nodejs-client/blob/master/samples/drive/list.js
const logger = require('./logger')
const fs = require('fs');
const path = require('path')
const { google } = require('googleapis');

// Global declarations
const drive = google.drive('v3');
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credentials.json'),
    scopes: 'https://www.googleapis.com/auth/drive',
    // Domain wide delegation from service account to actual G Suite user
    // https://github.com/googleapis/google-auth-library-nodejs/issues/610 
    clientOptions: { subject: 'webmaster@krb.nsw.edu.au' }
})

const authenticate = async () => {
    try {
        logger.info('Authenticating to Google API')
        const client = await auth.getClient();
        // Update drive client with new auth
        google.options({auth});
    } catch (e) {
        logger.error(e)
    }
}

const listFiles = async () => {
    try {
        let res = await drive.files.list({
            pageSize: 5,
            fields: 'files(id,name,fullFileExtension,webViewLink,createdTime)'
        });
        logger.info(res.data.files)
        return res.data.files
    } catch(err) {
        logger.error(err)
    }
};

const getFileMetadata = async (id) => {
    try {
        let res = await drive.files.get({
            fileId: id,
            fields: '*'
        });
        return res.data
    } catch(err) {
        logger.error(err)
    }
};

const createFolder = async (folderName, parentFolder) => {
    try {
        let res = await drive.files.create({
            resource: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolder]
            },
            fields: '*'
            //fields: 'files(id,name,webViewLink)'
        })
        return res.data
    } catch (err) {
        logger.error(err)
    }
}

const shareFolder = async (id, user) => {
    try {
        let res = await drive.permissions.create({
            fileId: id,
            sendNotificationEmail: false,
            resource: {
                type: 'user',
                role: 'writer',
                emailAddress: user
            }
        })
        return res.data
    } catch (err) {
        logger.error(err)
    }
}

const uploadFile = async (filePath, parentFolder) => {
    try {
        let res = await drive.files.create({
            resource: {
                name: path.basename(filePath),
                parents: [parentFolder]
            },
            media: {
                body: fs.createReadStream(path.resolve(filePath))
            }
            //fields: 'files(id,name,fullFileExtension,webViewLink,createdTime)'
        })
        return res.data
    } catch (err) {
        logger.error(err)
    }
}

module.exports = {
    authenticate: authenticate,
    listFiles: listFiles,
    getFileMetadata: getFileMetadata,
    createFolder: createFolder,
    uploadFile: uploadFile,
    shareFolder: shareFolder
}