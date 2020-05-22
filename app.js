const config = require('./config')
const gdrive = require('./lib/gdrive')
const zoom = require('./lib/zoom')
const fs = require('fs')
const filenamify = require('filenamify')
const path = require('path')
const { createLogger, format, transports } = require('winston');

// Initialise the logger
const myFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`
})
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.prettyPrint(),
    myFormat
  ),
  defaultMeta: { service: 'zoom-archiver' },
  transports: [
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    new transports.File({ filename: 'logs/zoom-archiver-error.log', level: 'error' }),
    new transports.File({ filename: 'logs/zoom-archiver-combined.log' }),
    new transports.Console({ level: 'info' })
  ]
});


async function start() {
    try {
        // Get Zoom recordings
        const recordings = await zoom.getRecordings()
        var recordingCount = 1
        for(const meeting of recordings.meetings){
            const datestamp = zoom.convertDate(meeting.start_time)
            logger.info('Processing ' + recordingCount + ' of ' + recordings.total_records + '... ' + meeting.topic + ' ' + meeting.uuid)

            // Create local directory to store Zoom meeting files
            const localdir = config.downloadFolder + '/' + filenamify(datestamp + ' - ' + meeting.host_email + ' - ' + meeting.id)
            logger.info(localdir)
            if (!fs.existsSync(localdir)) { fs.mkdirSync(localdir) }

            // Download all files from Zoom meeting
            for(const file of meeting.recording_files){
                //console.log(' - ' + file.download_url + ' ' + file.file_type.toLowerCase())
                if(file.status === 'completed') {  // only download if files are able to download
                    const localfile = localdir + '/' + filenamify(datestamp + ' - ' + meeting.topic + '.' + file.file_type.toLowerCase())
                    logger.info(' - Downloading: ' + localfile)
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
                logger.info(' - Uploading: ' + file)
                await gdrive.uploadFile(path.resolve(localdir, file), gdriveFolder.id)
            }

            // Share Google Drive folder
            await gdrive.shareFolder(gdriveFolder.id, meeting.host_email)
            logger.info(' - Shared with ' + meeting.host_email + ' ' + gdriveFolder.webViewLink)


            // Trash Zoom recording
            await zoom.trashRecordings(meeting.uuid)
            logger.info(' - Zoom recording sent to trash')

            recordingCount++
        }

    } catch (err) {
        logger.error(err)
    }
}

start()