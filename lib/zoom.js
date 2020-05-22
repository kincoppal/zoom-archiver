const config = require('../config')
const logger = require('./logger')
const axios = require('axios')
const fs = require('fs')  
const moment = require('moment')

// Calculate days of recordings to keep in Zoom Cloud
var now = moment()
var toDate = now.subtract(config.zoom.daysToKeep, 'day')

const options = {
    headers: {'Authorization': 'Bearer ' + config.zoom.token},
    responseType: 'json',
    params: {
        from: config.zoom.from,
        to: toDate.format('YYYY-MM-DD'),
        page_number: '1', 
        page_size: config.zoom.limit,
        status: 'active'
    }
}

const getRecordings = async () => {
    try {
        const response = await axios.get(config.zoom.baseUrl + '/accounts/me/recordings', options);
        const data = response.data;
        return data;
    } catch (error) {
        logger.error(error);
    }
};

const downloadRecordingFile = async (downloadUrl, filePath) => {
    try {
        const writer = fs.createWriteStream(filePath)
        const response = await axios.get(downloadUrl, {
            method: 'GET',
            responseType: 'stream',
            params: {
                access_token: config.zoom.token
            }
        })
        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })
    } catch (err) {
        logger.error(err)
    }
}

const trashOptions = {
    baseUrl: config.zoom.baseUrl,
    method: 'delete',
    headers: {'Authorization': 'Bearer ' + config.zoom.token},
    responseType: 'json',
    params: {
        action: 'trash' // store in trash for 30 days before pernament deletion
    },
}

const trashRecordings = async (uuid) => {
    try {
        // double encoding required for special characters in uuid
        // https://devforum.zoom.us/t/cant-retrieve-data-when-meeting-uuid-contains-double-slash/2776
        const id = encodeURIComponent(encodeURIComponent(uuid)) 
        const response = await axios.delete(config.zoom.baseUrl + `/meetings/${id}/recordings`, trashOptions);
        return response.status; // HTTP 204 = Meeting recording deleted
    } catch (error) {
        logger.error(error);
    } 
}

// Convert the Zoom UTC datestamp to localtime
// 2020-04-30T23:48:45Z to 2020-05-01 
const convertDate = (datestamp) => {
    // var date = new Date(datestamp)
    // return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + '.' + date.getMinutes())
    var date = moment(datestamp)
    return date.format('YYYY-MM-DD HH.mm')
}

module.exports = {
    getRecordings: getRecordings,
    downloadRecordingFile: downloadRecordingFile,
    trashRecordings: trashRecordings,
    convertDate: convertDate
}
