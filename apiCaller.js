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
			.then(response => resolve(response))
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
	const promises = urls.map(url => {
		return serviceCaller(url);
	});

	Promise.all(promises)
		.then(response => callback(undefined, response))
		.catch(reason => callback(reason));
};
