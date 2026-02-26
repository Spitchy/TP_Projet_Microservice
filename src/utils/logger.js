/**
 * Structured JSON Logger
 * Provides INFO/WARN/ERROR levels with structured output
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const formatLog = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
};

const logger = {
  info: (message, meta = {}) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, meta));
  },

  warn: (message, meta = {}) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, meta));
  },

  error: (message, meta = {}) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, meta));
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, meta));
    }
  },
};

module.exports = logger;
