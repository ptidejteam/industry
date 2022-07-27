const winston = require('winston');

//Configer logger here
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  defaultMeta: { service: '' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ],
});

module.exports = {
    logger
}