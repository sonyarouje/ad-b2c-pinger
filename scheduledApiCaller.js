const schedule = require('node-schedule');
const fs = require('fs');

const log = require('./log');
const fileManager = require('./fileManager');

var apiCaller = require('./apiCaller');

const urls = fileManager.getUrls();

exports.start = () => {
	const hours = process.env.SCHEDULED_HRS || '*';
	const interval = process.env.INTERVAL_IN_MIN || '5';

	var job = schedule.scheduleJob(`*/${interval} ${hours} * * *`, () => {
		log.log('running scheduler', 'scheduledApiCaller.js');
		if (process.env.NODE_ENV !== 'DEV') {
			apiCaller.multiApiCaller(urls, (err, data) => {
				if (err) {
					log.err('scheduled api caller error', 'scheduledApiCaller.js', err);
				} else {
					log.log('scheduled api called', 'scheduledApiCaller.js', data);
				}
			});
		} else {
			log.log('running in dev mode, will not call api in scheduler', 'scheduledApiCaller.js');
		}
	});
	return job;
};
