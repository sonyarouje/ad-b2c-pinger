const fs = require('fs');
const log = require('./log');

exports.saveLoginCredentials = (credentials, callback) => {
	if (!fs.existsSync(global.gConfig.credentials_path)) {
		fs.mkdirSync(global.gConfig.credentials_path);
	}
	if (fs.existsSync(`${global.gConfig.credentials_path}/current.json`)) {
		const date = new Date();
		const dt = ('0' + date.getDate()).slice(-2);
		const month = ('0' + (date.getMonth() + 1)).slice(-2);
		const year = date.getFullYear();

		const newFileName = `${global.gConfig.credentials_path}/current_${dt}-${month}-${year}.json`;
		fs.renameSync(`${global.gConfig.credentials_path}/current.json`, newFileName);
		log.log(`renamed existing file to ${newFileName}`, 'fileManager.js');
	}

	credentials.refreshed_on = new Date().getTime(); //Math.floor(new Date().getTime() / 1000);
	const data = JSON.stringify(credentials);

	try {
		fs.writeFileSync(`${global.gConfig.credentials_path}/current.json`, data);
		callback(undefined, 'credentials saved successfully');
	} catch (err) {
		callback(err);
	}
};

exports.saveB2CConfigs = (b2cConfig, callback) => {
	try {
		const data = JSON.stringify(b2cConfig);
		fs.writeFileSync(global.gConfig.b2c_config_file, data);
		log.log('b2c config file saved successfully', 'fileManager.js');
		callback(undefined, 'b2c config saved successfully');
	} catch (err) {
		callback(err);
	}
};

exports.saveUrls = (urls, callback) => {
	try {
		const data = JSON.stringify(urls);
		fs.writeFileSync(global.gConfig.urls_config_file, data);
		log.log('url file saved successfully', 'fileManager.js');
		callback(undefined, 'urls saved successfully');
	} catch (err) {
		callback(err);
	}
};

exports.urlsExist = () => {
	return fs.existsSync(global.gConfig.urls_config_file);
};

exports.b2cConfigExist = () => {
	return fs.existsSync(global.gConfig.b2c_config_file);
};

exports.credentialsExist = () => {
	return fs.existsSync(`${global.gConfig.credentials_path}/current.json`);
};

exports.getRefreshToken = () => {
	if (!this.credentialsExist()) {
		return '';
	}
	const raw = fs.readFileSync(`${global.gConfig.credentials_path}/current.json`);
	const credentials = JSON.parse(raw);
	return credentials.refresh_token;
};

exports.getCredentials = () => {
	if (!this.credentialsExist()) {
		return {};
	}
	const raw = fs.readFileSync(`${global.gConfig.credentials_path}/current.json`);
	const credentials = JSON.parse(raw);
	return credentials;
};

exports.getUrls = () => {
	if (!fs.existsSync(global.gConfig.urls_config_file)) {
		return [];
	}
	const raw = fs.readFileSync(global.gConfig.urls_config_file);
	const urls = JSON.parse(raw);
	return urls;
};

exports.getB2CConfigs = () => {
	if (!fs.existsSync(global.gConfig.b2c_config_file)) {
		return {
			token_uri: '',
		};
	}
	const raw = fs.readFileSync(global.gConfig.b2c_config_file);
	const config = JSON.parse(raw);
	return config;
};
