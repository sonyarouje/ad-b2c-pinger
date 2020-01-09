const winston = require('winston');
require('winston-daily-rotate-file');

const logFormat = winston.format.printf(
	info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message} ${info.meta ? 'meta' + JSON.stringify({ ...info.meta }) : ''}`
);
const tsFormat = () => new Date().toLocaleTimeString();

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.json(),
		winston.format.prettyPrint(),
		winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
	),
	transports: [
		//
		// - Write all logs with level `error` and below to `error.log`
		// - Write all logs with level `info` and below to `combined.log`
		//
		new winston.transports.DailyRotateFile({
			filename: `${global.gConfig.log_file_path}/error.log`,
			level: 'error',
			maxSize: '10m',
			maxFiles: '5d',
			createSymlink: process.env.CREATE_LOG_SYMLINK === 'true',
			symlinkName: 'error.log',
		}),
		new winston.transports.DailyRotateFile({
			filename: `${global.gConfig.log_file_path}/log.log`,
			maxSize: '10m',
			maxFiles: '5d',
			createSymlink: process.env.CREATE_LOG_SYMLINK === 'true',
			symlinkName: 'log.log',
		}),
	],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.SHOW_CONSOLE_LOG === 'true') {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), logFormat),
			timestamp: true,
		})
	);
}

exports.debug = (msg, label, meta) => {
	logger.debug({ message: msg, label: label, meta: meta });
};

exports.log = (msg, label, meta) => {
	logger.info({ message: msg, label: label, meta: meta });
};

exports.err = (msg, label, meta) => {
	logger.error({ message: msg, label: label, meta: meta });
};
