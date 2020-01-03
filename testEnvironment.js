const fileManager = require('./fileManager');
const apiCaller = require('./apiCaller');
const log = require('./log');

exports.checkConfigs = callback => {
	let response = {};
	response.urls = {};
	response.b2c_config = {};
	response.tokens = {};
	response.scheduler = {};

	const urlExist = fileManager.urlsExist();
	response.urls = {
		exist: urlExist,
		to_update: {
			api: '/save/urls',
			method: 'POST',
			sample_body: ['url_1', 'url_2'],
		},
	};
	response.b2c_config = {
		exist: fileManager.b2cConfigExist(),
		to_update: {
			api: '/save/b2cconfig',
			method: 'POST',
			sample_body: {
				client_id: 'id from azure ad b2c',
				client_secret: 'secret from azure ad b2c',
				user_flow_policy: 'B2C_1_signupsignin',
				token_uri: 'https://contoso.b2clogin.com/contoso.onmicrosoft.com/oauth2/v2.0/token',
			},
		},
	};

	const credentials = fileManager.getCredentials();
	const tmpDate = new Date(credentials.refreshed_on).toString();
	response.tokens = {
		exist: fileManager.credentialsExist(),
		last_refreshed: tmpDate,
		to_update: {
			api: '/save/login/tokens',
			method: 'POST',
			sample_body: {
				refresh_token: 'initial refresh token received from azure ad b2c',
				access_token: 'optional initial access token received from azure ad b2c',
				expires_on: 'optional expiry of access_token received from azure ad b2c, e.g. 1578036500',
			},
		},
	};
	response.scheduler = {
		scheduled_hrs: process.env.SCHEDULED_HRS || '*',
		url_invocation_interval_in_min: process.env.INTERVAL_IN_MIN || '5',
	};
	if (urlExist) {
		const urls = fileManager.getUrls();
		apiCaller.singleApiCaller(urls[0], (err, data) => {
			if (err) {
				response.test_url_invocation = {
					status: 'error',
					error: err,
				};
				log.err('error in test call', 'testEnvironment.js', err);
			} else {
				log.log('test api invocked successfully', 'testEnvironment.js', data);
				response.test_url_invocation = {
					status: 'success',
				};
			}
			callback(response);
		});
	} else {
		callback(response);
	}
};
