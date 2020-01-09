const Promise = require('promise');
const fetch = require('node-fetch');

const log = require('./log');
const fileManager = require('./fileManager');

let b2cconfig = fileManager.getB2CConfigs();

exports.assuretoken = () => {
	if (!b2cconfig.token_uri) {
		b2cconfig = fileManager.getB2CConfigs();
	}
	const credentials = fileManager.getCredentials();
	const currentUTCTime = Math.floor(new Date().getTime() / 1000);
	if (!b2cconfig.token_uri) {
		log.log('b2c configuration file not found.', 'tokenRefresher.js');
		return new Promise.reject('unable to find b2c configuration file');
	}

	if (currentUTCTime < credentials.expires_on) {
		return new Promise.resolve(credentials.access_token);
	} else {
		return refreshToken();
	}
};

const refreshToken = () => {
	return new Promise((resolve, reject) => {
		const refreshToken = fileManager.getRefreshToken();
		if (!refreshToken) reject('invalid refresh token');

		log.log('getting new bearer token', 'tokenRefresher.js');

		const config = {
			refresh_token: refreshToken,
			client_id: b2cconfig.client_id, //b2cconfig.b2c_config.client_id,
			client_secret: b2cconfig.client_secret,
			resource: 'common',
		};

		const grantType = 'refresh_token';
		grantAccessToken(grantType, config, b2cconfig.user_flow_policy)
			.then(resp => {
				fileManager.saveLoginCredentials(resp.response, (err, data) => {
					if (err) {
						log.err(err, 'tokenRefresher.js');
					} else {
						log.log(data, 'tokenRefresher.js');
					}
				});
				resolve(resp.response.access_token);
			})
			.catch(err => {
				log.log(err);
				const newErr = {
					code: 'invalid_token',
				};
				reject(newErr);
			});
	});
};

const grantAccessToken = (grantType, params, policy) => {
	// If resource is null or undefined, use `common` by default
	params.resource = params.resource || 'common';
	if (grantType === 'password') params['client_id'] = b2cconfig.client_id;
	return new Promise((resolve, reject) => {
		try {
			log.log(`${grantType} access token for resource ${params.resource}`, 'tokenRefresher.js');
			const body = `grant_type=${grantType}${_serialize(params)}`;

			if (!b2cconfig.token_uri) reject('token_uri not set in config');
			log.log(`grantAccessToken: url ${b2cconfig.token_uri}`, 'tokenRefresher.js');
			log.log('grantAccessToken: body', 'tokenRefresher.js', body);

			fetch(`${b2cconfig.token_uri}?p=${policy}`, {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body,
			})
				.then(response => {
					return response.text();
				})
				.then(res => {
					const cred = {
						resource: params.resource,
						response: JSON.parse(res.replace('access_token=', '')),
					};
					this.credentials = cred.response;

					if (cred.response.access_token) {
						log.log(`received access_token`, 'tokenRefresher.js');
						resolve(cred);
					} else {
						log.log(`failed to grant token ${cred.response}`, 'tokenRefresher.js');
						reject('failed to grant token');
					}
				});
			// .catch(reject);
		} catch (err) {
			reject(err);
		}
	});
};

function _serialize(params) {
	let paramStr = '';
	//TODO functionlize the below code.
	for (let prop in params) {
		if (params[prop] !== null && params[prop] !== void 0 && prop !== 'grant_type') paramStr += `&${prop}=${encodeURIComponent(params[prop])}`;
	}
	return paramStr;
}
