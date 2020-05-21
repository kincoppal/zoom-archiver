// Used this blog post as a guide: https://medium.com/@bretcameron/how-to-use-the-google-drive-api-with-javascript-57a6cc9e5262
const fs = require('fs');
const path = require('path')
const { google } = require('googleapis');
const credentials = require('../credentials.json');
const scopes = [
  'https://www.googleapis.com/auth/drive'
];
const auth = new google.auth.JWT(
  credentials.client_email, null,
  credentials.private_key, scopes
);
const drive = google.drive({ version: "v3", auth });

const listFiles = async () => {
    try {
        let res = await drive.files.list({
            pageSize: 5,
            fields: 'files(id,name,fullFileExtension,webViewLink,createdTime)'
            //fields: '*',
            //orderBy: 'createdTime desc'
        });
        return res.data.files
    } catch(err) {
        console.log(err)
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
        console.log(err)
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
        console.log(err)
    }
}

const shareFolder = async (id, user) => {
    try {
        let res = await drive.permissions.create({
            fileId: id,
            emailMessage: 'Your recent Zoom recording is now available on Google Drive',
            sendNotificationEmail: true,
            resource: {
                type: 'user',
                role: 'writer',
                emailAddress: user
            }
        })
        return res.data
    } catch (err) {
        console.log(err)
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
        console.log(err)
    }
}

module.exports = {
    listFiles: listFiles,
    getFileMetadata: getFileMetadata,
    createFolder: createFolder,
    uploadFile: uploadFile,
    shareFolder: shareFolder
}