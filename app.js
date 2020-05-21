const config = require('./config')
const gdrive = require('./lib/gdrive')
const zoom = require('./lib/zoom')
const fs = require('fs')
const filenamify = require('filenamify')
const path = require('path')

async function start() {
    try {
        // Get Zoom recordings
        const recordings = await zoom.getRecordings()
        var recordingCount = 1
        for(const meeting of recordings.meetings){
            const datestamp = zoom.convertDate(meeting.start_time)
            console.log('Processing ' + recordingCount + ' of ' + recordings.total_records + '... ' + meeting.topic + ' ' + meeting.uuid)

            // Create local directory to store Zoom meeting files
            const localdir = config.downloadFolder + '/' + filenamify(datestamp + ' - ' + meeting.host_email + ' - ' + meeting.id)
            console.log(localdir)
            if (!fs.existsSync(localdir)) { fs.mkdirSync(localdir) }

            // Download all files from Zoom meeting
            for(const file of meeting.recording_files){
                //console.log(' - ' + file.download_url + ' ' + file.file_type.toLowerCase())
                if(file.status === 'completed') {  // only download if files are able to download
                    const localfile = localdir + '/' + filenamify(datestamp + ' - ' + meeting.topic + '.' + file.file_type.toLowerCase())
                    console.log(' - Downloading: ' + localfile)
                    await zoom.downloadRecordingFile(file.download_url, localfile)
                }
                if(file.status === 'processing') { 
                    throw new Error('Files from meeting uuid[' + meeting.uuid + '] are still processing') 
                }
            }
            // Create folder in Google Drive
            var gdriveFolder = await gdrive.createFolder('Zoom Recording - ' + datestamp + ' - ' + meeting.topic, config.gdriveUploadFolder)

            // Upload files to Google Drive folder
            var files = await fs.promises.readdir(localdir)
            for (const file of files){
                console.log(' - Uploading:', file)
                await gdrive.uploadFile(path.resolve(localdir, file), gdriveFolder.id)
            }

            // Share Google Drive folder
            await gdrive.shareFolder(gdriveFolder.id, meeting.host_email)
            console.log(' - Shared with ' + meeting.host_email + ' ' + gdriveFolder.webViewLink)


            // Trash Zoom recording
            await zoom.trashRecordings(meeting.uuid)

            recordingCount++
        }

    } catch (err) {
        console.log(err)
    }
}

start()