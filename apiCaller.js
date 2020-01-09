const Promise = require('promise');
const fetch = require('node-fetch');

const tokenRefresher = require('./tokenRefresher');

const optionMaker = (method, body, token, jsonifyBody) => {
	const options = {
		method: method,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	};
	if (body) {
		options.body = jsonifyBody ? JSON.stringify(body) : body;
	}
	return options;
};

const httpOptionsAsync = (method, body, jsonifyBody = true) => {
	return new Promise((resolve, reject) => {
		tokenRefresher
			.assuretoken()
			.then(token => {
				resolve(optionMaker(method, body, token, jsonifyBody));
			})
			.catch(reason => {
				reject(reason);
			});
	});
};

const serviceCaller = url => {
	return new Promise((resolve, reject) => {
		httpOptionsAsync('GET', undefined, false)
			.then(httpOptions => {
				return fetch(url, httpOptions);
			})
			.then(response => {
				const invocationStatus = {
					url: url,
					status: 'success',
				};
				resolve(invocationStatus);
			})
			.catch(reason => {
				reject(reason);
			});
	});
};

exports.singleApiCaller = (url, callback) => {
	serviceCaller(url)
		.then(response => callback(undefined, response))
		.catch(reason => {
			callback(reason);
		});
};

exports.multiApiCaller = (urls, callback) => {
	if (!urls) {
		callback('invalid param. urls should be a valid array');
	}
	const promises = urls.map(url => () => serviceCaller(url));
	promiseSerial(promises)
		.then(response => callback(undefined, response))
		.catch(reason => callback(reason));
};

const promiseSerial = promises =>
	promises.reduce((promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]));
