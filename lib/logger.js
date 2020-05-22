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

module.exports = logger